import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Settings } from '../models/Settings.js';
import { slugify } from '../lib/utils.js';
import { sendShippingUpdate } from '../lib/mailer.js';

const router = Router();

// ── Products ─────────────────────────────────────────────────────────────────

// GET /api/admin/products
router.get('/products', requireAdmin, async (req, res) => {
  const { sort, limit = '20', page = '1', q, category } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ products: products.map(p => ({ ...p, id: p._id.toString(), _id: p._id.toString() })), total });
});

// POST /api/admin/products
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.slug) body.slug = slugify(body.name ?? '');
    const product = await Product.create(body);
    res.status(201).json({ ...product.toObject(), id: product._id.toString() });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 11000) { res.status(409).json({ error: 'A product with this slug already exists' }); return; }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /api/admin/products/:id
router.patch('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
    res.json({ ...product, id: product._id.toString(), _id: product._id.toString() });
  } catch {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requireAdmin, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ ok: true });
});

// ── Orders ───────────────────────────────────────────────────────────────────

// GET /api/admin/orders
router.get('/orders', requireAdmin, async (req, res) => {
  const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ orders: orders.map(o => ({ ...o, id: o._id.toString(), _id: o._id.toString() })), total });
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  const { status, note } = req.body as { status: string; note?: string };
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, $push: { timeline: { status, timestamp: new Date(), note: note ?? '' } } },
    { new: true }
  ).lean();
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  if (['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    try {
      const emailTo = (order as any).userId !== 'guest'
        ? (await User.findById((order as any).userId).lean())?.email
        : (order as any).guestEmail;
      if (emailTo && order) {
        sendShippingUpdate(emailTo, order as any, status).catch(() => {});
      }
    } catch {}
  }

  res.json({ ...order, id: order._id.toString() });
});

// ── Users ────────────────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  const { page = '1', limit = '20', q } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    User.countDocuments(filter),
  ]);
  res.json({
    users: users.map(u => ({ ...u, id: u._id.toString(), _id: u._id.toString(), password: undefined })),
    total,
  });
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', requireAdmin, async (req, res) => {
  const allowed = ['role', 'isActive', 'loyaltyPoints'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
  const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean();
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ ...user, id: user._id.toString(), password: undefined });
});

// ── Settings ─────────────────────────────────────────────────────────────────

// PATCH /api/admin/settings
router.patch('/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { _key: 'store' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(settings!.toObject());
  } catch {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ── Analytics ────────────────────────────────────────────────────────────────

// GET /api/admin/analytics
router.get('/analytics', requireAdmin, async (_req, res) => {
  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    totalRevenue: totalRevenue[0]?.total ?? 0,
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrders: recentOrders.map(o => ({ ...o, id: o._id.toString() })),
    ordersByStatus: ordersByStatus.reduce((acc: Record<string, number>, s: { _id: string; count: number }) => {
      acc[s._id] = s.count; return acc;
    }, {}),
  });
});

export default router;
