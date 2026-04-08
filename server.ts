import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();

// Raw body for Stripe webhooks (must come before express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil' as any,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Agent chat endpoint — AdmitOS main AI agent
app.post('/api/agent/chat', async (req, res) => {
  const { messages, system } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: system || `You are AdmitOS Agent — an elite college admissions AI assistant.
You help students strategically plan their applications to top universities (Ivy League, Top 30 US, Oxbridge, G5 UK).
You analyze student profiles, generate positioning reports, build strategic school lists, plan essays, and provide step-by-step guidance.
Be concise, strategic, and data-driven. Use structured output when appropriate.`,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Adie wellbeing chat endpoint
app.post('/api/adie/chat', async (req, res) => {
  const { messages } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are Adie, a warm and empathetic AI wellbeing companion for students going through the high-stakes college application process.
You provide emotional support, help manage anxiety and stress, and offer practical coping strategies.
You are NOT a licensed therapist. Be warm, brief, and caring. Use simple, supportive language.
Never give clinical advice. If a student expresses serious distress, gently suggest they speak to a counselor.`,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ── Stripe method mapping ─────────────────────────────────────────────────────
// apple_pay / google_pay → 'card'  (Stripe Checkout auto-shows them on supported browsers)
// link                   → 'link'
// paypal                 → 'paypal'
// klarna                 → 'klarna'      (one-time only)
// afterpay               → 'afterpay_clearpay' (one-time only)
// bacs_debit             → 'bacs_debit'
// wechat_pay             → 'wechat_pay'  (one-time only, needs wechat_pay client option)
// alipay                 → 'alipay'

const ONE_TIME_METHOD_MAP: Record<string, string> = {
  card:       'card',
  apple_pay:  'card',
  google_pay: 'card',
  paypal:     'paypal',
  link:       'link',
  klarna:     'klarna',
  afterpay:   'afterpay_clearpay',
  wechat_pay: 'wechat_pay',
  alipay:     'alipay',
};

// For subscriptions: Klarna, Afterpay, WeChat are not supported for recurring
const SUBSCRIPTION_METHOD_MAP: Record<string, string> = {
  card:       'card',
  apple_pay:  'card',
  google_pay: 'card',
  paypal:     'paypal',
  link:       'link',
  alipay:     'alipay',
};

// ── Stripe: One-time credit top-up ────────────────────────────────────────────
app.post('/api/payments/create-checkout-session', async (req, res) => {
  const { amount, credits, paymentMethod } = req.body;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const stripeMethod = ONE_TIME_METHOD_MAP[paymentMethod] || 'card';

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: [stripeMethod] as any,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${credits} AdmitOS Credits`,
              description: 'AI agent execution credits — never expire',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/dashboard/pricing?payment=success&credits=${credits}`,
      cancel_url: `${appUrl}/dashboard/pricing`,
    };

    // WeChat Pay requires explicit client option
    if (stripeMethod === 'wechat_pay') {
      (sessionParams as any).payment_method_options = {
        wechat_pay: { client: 'web' },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Stripe: Subscription plan checkout ────────────────────────────────────────
app.post('/api/payments/create-subscription-session', async (req, res) => {
  const { plan, paymentMethod } = req.body;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const planDetails: Record<string, { amount: number; name: string; description: string }> = {
    basic: { amount: 1900, name: 'AdmitOS Basic', description: '100 monthly credits · Standard roadmap' },
    plus: { amount: 4900, name: 'AdmitOS Plus', description: '500 monthly credits · Advanced AI planning' },
  };

  const details = planDetails[plan];
  if (!details) return res.status(400).json({ error: 'Invalid plan' });

  const stripeMethod = SUBSCRIPTION_METHOD_MAP[paymentMethod] || 'card';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [stripeMethod] as any,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: details.name, description: details.description },
            unit_amount: details.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard/pricing?subscription=success&plan=${plan}`,
      cancel_url: `${appUrl}/dashboard/pricing`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe subscription error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Stripe: Webhook (payment confirmation) ────────────────────────────────────
app.post('/api/payments/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!secret) {
    // In dev without a webhook secret, just acknowledge
    res.json({ received: true });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment succeeded:', session.id, session.amount_total);
      // TODO: credit the user's account in your database
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Subscription renewed:', invoice.id);
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});

// ── Stripe: Customer Portal (manage subscription) ─────────────────────────────
app.post('/api/payments/customer-portal', async (req, res) => {
  const { customerId } = req.body;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!customerId) {
    return res.status(400).json({ error: 'customerId required' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/pricing`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AdmitOS API server running on http://localhost:${PORT}`);
});
