import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Stripe from 'stripe'
import dotenv from 'dotenv'

// Load env variables from .env.local
dotenv.config({ path: '.env.local' })

// Helper to parse POST request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'stripe-api-middleware',
      configureServer(server) {
        const transferredSessions = new Set();

        server.middlewares.use(async (req, res, next) => {
          // Endpoint 1: Create Stripe Checkout Session (for split payments)
          if (req.url.startsWith('/api/create-checkout-session') && req.method === 'POST') {
            try {
              const body = await parseRequestBody(req);
              const { productId, name, amount, qty, orderId, sellerStripeAccountId, brandStripeAccountId, brandAmount, sellerAmount } = body;
              
              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable in .env.local' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    price_data: {
                      currency: 'thb',
                      product_data: {
                        name: name || 'คำสั่งซื้อจาก MyMarket',
                      },
                      unit_amount: Math.round(amount * 100), // in Satang
                    },
                    quantity: qty || 1,
                  },
                ],
                mode: 'payment',
                success_url: `http://localhost:5173/?payment_success=true&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/?payment_cancel=true&order_id=${orderId}`,
                // Save split targets and amounts in metadata so they are processed on status check / webhook success
                metadata: {
                  orderId: orderId,
                  brandStripeAccountId: brandStripeAccountId || "",
                  sellerStripeAccountId: sellerStripeAccountId || "",
                  brandAmount: brandAmount ? String(Math.round(brandAmount * 100)) : "0", // in Satang
                  sellerAmount: sellerAmount ? String(Math.round(sellerAmount * 100)) : "0", // in Satang
                }
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ url: session.url, id: session.id }));
            } catch (err) {
              console.error("Stripe error creating session:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 2: Retrieve Stripe Session Status & Trigger Split Transfers
          if (req.url.startsWith('/api/check-session-status') && req.method === 'GET') {
            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const sessionId = url.searchParams.get('session_id');

              if (!sessionId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing session_id query parameter' }));
                return;
              }

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent'],
              });

              // Perform transfers if payment succeeded and transfers haven't run yet
              if (session.payment_status === 'paid' && !transferredSessions.has(sessionId)) {
                const { brandStripeAccountId, sellerStripeAccountId, brandAmount, sellerAmount, orderId } = session.metadata || {};
                const chargeId = session.payment_intent?.latest_charge;
                
                console.log(`Processing split payment for order ${orderId}. Session: ${sessionId}, Charge ID: ${chargeId}`);
                
                if (!chargeId) {
                  console.error("Could not execute split payment transfers: latest_charge ID is missing from expanded payment intent.");
                } else {
                  // 1. Transfer to Brand
                  if (brandStripeAccountId && brandAmount && parseInt(brandAmount) > 0) {
                    try {
                      const brandTransfer = await stripe.transfers.create({
                        amount: parseInt(brandAmount),
                        currency: 'thb',
                        destination: brandStripeAccountId,
                        source_transaction: chargeId,
                        description: `Brand share for order ${orderId}`,
                      });
                      console.log(`Transferred ${brandAmount} satang to Brand (${brandStripeAccountId}). Transfer ID: ${brandTransfer.id}`);
                    } catch (e) {
                      console.error(`Error transferring to Brand (${brandStripeAccountId}):`, e.message);
                    }
                  }

                  // 2. Transfer to Seller
                  if (sellerStripeAccountId && sellerAmount && parseInt(sellerAmount) > 0) {
                    try {
                      const sellerTransfer = await stripe.transfers.create({
                        amount: parseInt(sellerAmount),
                        currency: 'thb',
                        destination: sellerStripeAccountId,
                        source_transaction: chargeId,
                        description: `Seller profit for order ${orderId}`,
                      });
                      console.log(`Transferred ${sellerAmount} satang to Seller (${sellerStripeAccountId}). Transfer ID: ${sellerTransfer.id}`);
                    } catch (e) {
                      console.error(`Error transferring to Seller (${sellerStripeAccountId}):`, e.message);
                    }
                  }
                }

                transferredSessions.add(sessionId);
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                status: session.status, 
                payment_status: session.payment_status 
              }));
            } catch (err) {
              console.error("Stripe error retrieving session:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 3: Create Stripe Connect Express Account and Link
          if (req.url.startsWith('/api/create-connect-account') && req.method === 'GET') {
            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const role = url.searchParams.get('role') || 'brand';

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable in .env.local' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

              // Create custom Express account
              const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                  card_payments: { requested: true },
                  transfers: { requested: true },
                },
              });

              // Create Account Link for Express Onboarding
              const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `http://localhost:5173/?stripe_connect_status=refresh&role=${role}`,
                return_url: `http://localhost:5173/?stripe_connect_status=success&role=${role}&account_id=${account.id}`,
                type: 'account_onboarding',
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ url: accountLink.url, accountId: account.id }));
            } catch (err) {
              console.error("Stripe Connect link error:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 4: Create Stripe Connect Account Silently (without redirect)
          if (req.url.startsWith('/api/create-connect-account-silent') && req.method === 'GET') {
            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const role = url.searchParams.get('role') || 'brand';
              const displayName = role === 'brand' ? 'MyMarket Brand Owner' : 'MyMarket Seller';

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable in .env.local' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              
              let account;
              try {
                // Create a verified Custom account in Test Mode with transfers capability active immediately
                account = await stripe.accounts.create({
                  type: 'custom',
                  country: 'US',
                  business_type: 'individual',
                  business_profile: {
                    name: displayName,
                    mcc: '5732',
                    url: 'https://mymarket-test.com',
                  },
                  capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                  },
                  tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: '127.0.0.1',
                  },
                  individual: {
                    first_name: role === 'brand' ? 'Brand' : 'Seller',
                    last_name: 'Partner',
                    email: 'test@example.com',
                    dob: { day: 1, month: 1, year: 1990 },
                    address: {
                      line1: '123 Stripe Way',
                      city: 'San Francisco',
                      state: 'CA',
                      postal_code: '94111',
                      country: 'US',
                    },
                    phone: '+15555550100',
                    id_number: '000000000', // mock SSN
                  },
                  external_account: {
                    object: 'bank_account',
                    country: 'US',
                    currency: 'usd',
                    routing_number: '110000000',
                    account_number: '000999999991', // verified test account
                  }
                });
              } catch (e) {
                console.warn("Custom silent creation failed, falling back to basic Standard Connect:", e.message);
                // Fallback to basic Standard account type
                account = await stripe.accounts.create({
                  type: 'standard',
                  business_profile: {
                    name: displayName,
                  },
                });
              }

              // Get main platform account ID dynamically
              let mainAccountId = "";
              try {
                const platformAccount = await stripe.accounts.retrieve();
                mainAccountId = platformAccount.id;
              } catch (e) {
                console.warn("Could not retrieve platform account ID:", e.message);
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ accountId: account.id, mainAccountId: mainAccountId }));
            } catch (err) {
              console.error("Stripe Connect silent error:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Otherwise, fall through to other middleware
          next();
        });
      }
    }
  ],
})
