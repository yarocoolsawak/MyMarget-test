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
        server.middlewares.use(async (req, res, next) => {
          // Endpoint 1: Create Stripe Checkout Session
          if (req.url.startsWith('/api/create-checkout-session') && req.method === 'POST') {
            try {
              const body = await parseRequestBody(req);
              const { productId, name, amount, qty, orderId, connectedAccountId } = body;
              
              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable in .env.local' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              
              const sessionOptions = {};
              if (connectedAccountId) {
                sessionOptions.stripeAccount = connectedAccountId;
              }

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
                success_url: `http://localhost:5173/?payment_success=true&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}${connectedAccountId ? `&connected_account_id=${connectedAccountId}` : ''}`,
                cancel_url: `http://localhost:5173/?payment_cancel=true&order_id=${orderId}`,
              }, sessionOptions);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ url: session.url, id: session.id }));
            } catch (err) {
              console.error("Stripe error creating session:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Endpoint 2: Retrieve Stripe Session Status
          if (req.url.startsWith('/api/check-session-status') && req.method === 'GET') {
            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const sessionId = url.searchParams.get('session_id');
              const connectedAccountId = url.searchParams.get('connected_account_id');

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
              
              const sessionOptions = {};
              if (connectedAccountId) {
                sessionOptions.stripeAccount = connectedAccountId;
              }

              const session = await stripe.checkout.sessions.retrieve(sessionId, sessionOptions);

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
              if (!process.env.STRIPE_SECRET_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY environment variable in .env.local' }));
                return;
              }

              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              
              let account;
              try {
                // Try creating Express account (best UX for platforms)
                account = await stripe.accounts.create({
                  type: 'express',
                  capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                  },
                });
              } catch (e) {
                console.warn("Express silent creation failed, falling back to Standard Connect:", e.message);
                // Fallback to Standard account type
                account = await stripe.accounts.create({
                  type: 'standard',
                });
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ accountId: account.id }));
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
