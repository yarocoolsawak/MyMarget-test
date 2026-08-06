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

              if (session.payment_status === 'paid' && !transferredSessions.has(sessionId)) {
                console.log(`Payment verified for order ${session.metadata?.orderId || "unknown"}. Held on platform for 7-day hold period.`);
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

          // Endpoint 5: Retrieve Connected Account Balance
          if (req.url.startsWith('/api/get-stripe-balance') && req.method === 'GET') {
            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const accountId = url.searchParams.get('account_id');
              
              if (!accountId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing account_id parameter' }));
                return;
              }

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              const balance = await stripe.balance.retrieve({}, {
                stripeAccount: accountId,
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(balance));
            } catch (err) {
              console.error("Stripe error retrieving balance:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 6: Retrieve Account details (for bank info)
          if (req.url.startsWith('/api/get-account-details') && req.method === 'GET') {
            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const accountId = url.searchParams.get('account_id');
              
              if (!accountId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing account_id parameter' }));
                return;
              }

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              const account = await stripe.accounts.retrieve(accountId);
              const bankAccount = account.external_accounts?.data?.[0] || null;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                bankName: bankAccount?.bank_name || "Stripe Test Bank",
                last4: bankAccount?.last4 || "9991",
                country: account.country,
                defaultCurrency: account.default_currency,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted
              }));
            } catch (err) {
              console.error("Stripe error retrieving account details:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 7: Create Payout
          if (req.url.startsWith('/api/create-payout') && req.method === 'POST') {
            try {
              const body = await parseRequestBody(req);
              const { accountId, amount } = body;

              if (!accountId || !amount) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing accountId or amount parameters' }));
                return;
              }

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              const payout = await stripe.payouts.create({
                amount: Math.round(amount),
                currency: 'usd',
              }, {
                stripeAccount: accountId,
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(payout));
            } catch (err) {
              console.error("Stripe error creating payout:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 8: Top up test funds (transfer USD from platform to connected account available balance)
          if (req.url.startsWith('/api/top-up-test-funds') && req.method === 'POST') {
            try {
              const body = await parseRequestBody(req);
              const { accountId } = body;

              if (!accountId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing accountId parameter' }));
                return;
              }

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              
              // 1. Create a charge on the Platform account using the special tok_bypassPending token
              // This instantly funds the Platform's Available Balance with $600 USD to cover the Connect transfer
              await stripe.charges.create({
                amount: 60000, // $600.00 USD in cents
                currency: 'usd',
                source: 'tok_bypassPending',
                description: 'Funding platform available balance for Connect top-up',
              });

              // 2. Transfer $500 USD (50000 cents) from platform balance to connected account available balance
              const transfer = await stripe.transfers.create({
                amount: 50000,
                currency: 'usd',
                destination: accountId,
                description: 'Test mode available balance top up',
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(transfer));
            } catch (err) {
              console.error("Stripe error topping up test funds:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 9: Refund Stripe Charge and Reverse Connect Transfers
          if (req.url.startsWith('/api/refund-stripe-order') && req.method === 'POST') {
            try {
              const body = await parseRequestBody(req);
              const { sessionId } = body;

              if (!sessionId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing sessionId parameter' }));
                return;
              }

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              
              // 1. Retrieve the checkout session and expand the payment intent to find the latest charge
              const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent'],
              });

              const paymentIntent = session.payment_intent;
              if (!paymentIntent) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No payment intent associated with this session' }));
                return;
              }

              const chargeId = paymentIntent.latest_charge;
              if (!chargeId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No charge ID associated with this payment intent' }));
                return;
              }

              // 2. Create the refund on the platform charge
              const refund = await stripe.refunds.create({
                charge: chargeId,
              });

              // 3. List and reverse transfers associated with this charge (Separate Charges and Transfers reversal)
              const transfers = await stripe.transfers.list({
                source_transaction: chargeId,
              });

              const reversals = [];
              for (const transfer of transfers.data) {
                try {
                  const reversal = await stripe.transfers.createReversal(transfer.id, {
                    description: `Reversal for refunded session ${sessionId}`,
                  });
                  reversals.push({ transferId: transfer.id, reversalId: reversal.id });
                } catch (revErr) {
                  console.error(`Failed to reverse transfer ${transfer.id}:`, revErr.message);
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ refund, reversals }));
            } catch (err) {
              console.error("Stripe refund error:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 10: Process Delayed Payout Transfers
          if (req.url.startsWith('/api/process-delayed-transfers') && req.method === 'POST') {
            try {
              const body = await parseRequestBody(req);
              const { brandStripeAccountId, sellerStripeAccountId, brandAmount, sellerAmount, sessionId, orderId } = body;

              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              let resolvedChargeId = undefined;

              if (sessionId) {
                try {
                  const session = await stripe.checkout.sessions.retrieve(sessionId, {
                    expand: ['payment_intent'],
                  });
                  resolvedChargeId = session.payment_intent?.latest_charge;
                } catch (sessErr) {
                  console.error("Error resolving session latest charge:", sessErr.message);
                }
              }

              const results = [];

              // 1. Transfer to Brand
              if (brandStripeAccountId && brandAmount && parseInt(brandAmount) > 0) {
                try {
                  const brandTransfer = await stripe.transfers.create({
                    amount: Math.round(brandAmount), // in USD cents
                    currency: 'usd',
                    destination: brandStripeAccountId,
                    source_transaction: resolvedChargeId || undefined,
                    description: `Delayed Brand share for order ${orderId}`,
                  });
                  results.push({ type: 'brand', status: 'success', id: brandTransfer.id, amount: brandAmount });
                } catch (e) {
                  console.error(`Error in delayed transfer to Brand (${brandStripeAccountId}):`, e.message);
                  results.push({ type: 'brand', status: 'error', error: e.message });
                }
              }

              // 2. Transfer to Seller
              if (sellerStripeAccountId && sellerAmount && parseInt(sellerAmount) > 0) {
                try {
                  const sellerTransfer = await stripe.transfers.create({
                    amount: Math.round(sellerAmount), // in USD cents
                    currency: 'usd',
                    destination: sellerStripeAccountId,
                    source_transaction: chargeId || undefined,
                    description: `Delayed Seller profit for order ${orderId}`,
                  });
                  results.push({ type: 'seller', status: 'success', id: sellerTransfer.id, amount: sellerAmount });
                } catch (e) {
                  console.error(`Error in delayed transfer to Seller (${sellerStripeAccountId}):`, e.message);
                  results.push({ type: 'seller', status: 'error', error: e.message });
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, results }));
            } catch (err) {
              console.error("Stripe delayed transfer error:", err);
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
