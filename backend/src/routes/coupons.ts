import { Router } from 'express';
import { Coupon } from '../models/Coupon.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  const { code, orderAmount } = req.body as { code: string; orderAmount: number };
  if (!code) { res.status(400).json({ error: 'Coupon code is required' }); return; }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true }).lean();
  if (!coupon) { res.status(404).json({ error: 'Invalid or expired coupon code' }); return; }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    res.status(400).json({ error: 'This coupon has expired' }); return;
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400).json({ error: 'This coupon has reached its usage limit' }); return;
  }
  if (orderAmount < coupon.minOrderAmount) {
    res.status(400).json({ error: `Minimum order amount of PKR ${coupon.minOrderAmount.toLocaleString()} required` }); return;
  }

  let discount = coupon.type === 'percent'
    ? (orderAmount * coupon.value) / 100
    : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  res.json({ valid: true, discount: Math.floor(discount), coupon: { code: coupon.code, type: coupon.type, value: coupon.value } });
});

// ── Admin CRUD ──
// GET /api/admin/coupons
router.get('/admin/list', requireAdmin, async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ coupons: coupons.map(c => ({ ...c, id: c._id.toString() })) });
});

// POST /api/admin/coupons
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code?.toUpperCase() });
    res.status(201).json({ ...coupon.toObject(), id: coupon._id.toString() });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 11000) { res.status(409).json({ error: 'Coupon code already exists' }); return; }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PATCH /api/admin/coupons/:id
router.patch('/admin/:id', requireAdmin, async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!coupon) { res.status(404).json({ error: 'Coupon not found' }); return; }
  res.json({ ...coupon, id: coupon._id.toString() });
});

// DELETE /api/admin/coupons/:id
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
