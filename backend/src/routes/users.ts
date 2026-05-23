import { Router } from 'express';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/users/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    // Only return public profile
    res.json({
      id: user._id.toString(),
      uid: user._id.toString(),
      name: user.name,
      displayName: user.displayName ?? user.name,
      photoURL: user.photoURL,
      role: user.role,
    });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET /api/users/:userId/orders
router.get('/:userId/orders', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
  res.json({ orders: orders.map(o => ({ ...o, id: o._id.toString(), _id: o._id.toString() })) });
});

// GET /api/users/:userId/cart
router.get('/:userId/cart', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const user = await User.findById(req.params.userId).select('cart').lean();
  res.json({ items: (user as any)?.cart ?? [] });
});

// PUT /api/users/:userId/cart
router.put('/:userId/cart', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  await User.findByIdAndUpdate(req.params.userId, { cart: req.body.items ?? [] });
  res.json({ ok: true });
});

// DELETE /api/users/:userId/cart
router.delete('/:userId/cart', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  await User.findByIdAndUpdate(req.params.userId, { cart: [] });
  res.json({ ok: true });
});

// PATCH /api/users/:userId/wishlist
router.patch('/:userId/wishlist', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const { productId, action } = req.body as { productId: string; action: 'add' | 'remove' };
  const update = action === 'add'
    ? { $addToSet: { wishlist: productId } }
    : { $pull: { wishlist: productId } };
  await User.findByIdAndUpdate(req.params.userId, update);
  res.json({ ok: true });
});

export default router;
