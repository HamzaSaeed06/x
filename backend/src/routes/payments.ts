import { Router } from 'express';
import { Order } from '../models/Order.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// ── Stripe ──────────────────────────────────────────────────────────────────
router.post('/stripe/create-intent', requireAuth, async (req: AuthRequest, res) => {
  const { amount, orderId } = req.body as { amount: number; orderId: string };
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(503).json({ error: 'Stripe is not configured on this server' });
    return;
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'pkr',
      metadata: { orderId, userId: req.user!.id },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) { res.json({ ok: true }); return; }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const orderId = (intent as { metadata?: { orderId?: string } }).metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          $push: { timeline: { status: 'confirmed', timestamp: new Date(), note: 'Payment confirmed via Stripe' } },
          status: 'confirmed',
        });
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: 'Webhook error' });
  }
});

// ── JazzCash ─────────────────────────────────────────────────────────────────
router.post('/jazzcash/initiate', requireAuth, async (req: AuthRequest, res) => {
  const { amount, orderId } = req.body as { amount: number; orderId: string };
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

  if (!merchantId || !password || !integritySalt) {
    res.status(503).json({ error: 'JazzCash is not configured on this server' });
    return;
  }

  const txnRefNo = `T${Date.now()}`;
  const txnDateTime = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const txnExpiryDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
  const amountPaisa = (amount * 100).toString();

  const hashStr = `${integritySalt}&${amountPaisa}&PKR&${merchantId}&${txnDateTime}&${txnExpiryDateTime}&${txnRefNo}&mwallet`;
  const hash = crypto.createHmac('sha256', integritySalt).update(hashStr).digest('hex');

  res.json({
    merchantId,
    txnRefNo,
    txnDateTime,
    txnExpiryDateTime,
    txnAmount: amountPaisa,
    txnCurrency: 'PKR',
    ppSecureHash: hash,
    orderId,
    returnUrl: `${process.env.FRONTEND_URL ?? ''}/order-confirmation?orderId=${orderId}`,
  });
});

// ── EasyPaisa ────────────────────────────────────────────────────────────────
router.post('/easypaisa/initiate', requireAuth, async (req: AuthRequest, res) => {
  const { amount, orderId } = req.body as { amount: number; orderId: string };
  const storeId = process.env.EASYPAY_STORE_ID;
  const hashKey = process.env.EASYPAY_HASH_KEY;

  if (!storeId || !hashKey) {
    res.status(503).json({ error: 'EasyPaisa is not configured on this server' });
    return;
  }

  const orderRefNum = `EP${Date.now()}`;
  const amountStr = amount.toFixed(2);
  const hashStr = `amount=${amountStr}&orderRefNum=${orderRefNum}&storeId=${storeId}&timeStamp=${Date.now()}&token=${hashKey}`;
  const hash = crypto.createHash('sha256').update(hashStr).digest('hex');

  res.json({
    storeId,
    orderId,
    orderRefNum,
    transactionAmount: amountStr,
    mobileAccountNo: '',
    emailAddress: req.body.email ?? '',
    merchantHashedReq: hash,
    returnUrl: `${process.env.FRONTEND_URL ?? ''}/order-confirmation?orderId=${orderId}`,
  });
});

export default router;
