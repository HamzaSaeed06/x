import { Router } from 'express';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { requireAuth, requireAdmin, optionalAuth, type AuthRequest } from '../middleware/auth.js';
import { Settings } from '../models/Settings.js';
import { sendOrderConfirmation } from '../lib/mailer.js';
import { logger } from '../lib/logger.js';

const router = Router();

// POST /api/orders
router.post('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { guestEmail, items, address, paymentMethod, couponCode, discount = 0 } = req.body;
    if (!items?.length || !address) {
      res.status(400).json({ error: 'Items and address are required' });
      return;
    }
    // Always derive identity from the verified JWT, never trust client-supplied userId
    const resolvedUserId = req.user?.id ?? 'guest';

    const settings = await Settings.findOne({ _key: 'store' }).lean();
    const freeThreshold = (settings as any)?.freeDeliveryThreshold ?? 5000;
    const shippingCost = (settings as any)?.standardShippingCost ?? 299;

    const subtotal = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0);
    const shipping = subtotal >= freeThreshold ? 0 : shippingCost;
    const total = subtotal + shipping - discount;

    // Validate coupon if present
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          res.status(400).json({ error: 'Coupon usage limit reached' });
          return;
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          res.status(400).json({ error: 'Coupon has expired' });
          return;
        }
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const order = await Order.create({
      userId: resolvedUserId,
      guestEmail,
      items,
      subtotal,
      shipping,
      discount,
      couponCode,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      address,
      timeline: [{ status: 'pending', timestamp: new Date(), note: 'Order placed' }],
    });

    // Send order confirmation email
    try {
      const emailTo = resolvedUserId !== 'guest'
        ? (await User.findById(resolvedUserId).lean())?.email
        : guestEmail;
      if (emailTo) {
        sendOrderConfirmation(emailTo, order).catch(err =>
          logger.warn({ err }, 'Order confirmation email failed')
        );
      }
    } catch {}

    // Update product sold count
    for (const item of items) {
      if (item.productId) {
        Product.findByIdAndUpdate(item.productId, { $inc: { sold: item.qty, stock: -item.qty } }).exec().catch(() => {});
      }
    }

    // Update user stats — only for verified authenticated users, never for guests
    if (resolvedUserId !== 'guest') {
      User.findByIdAndUpdate(resolvedUserId, {
        $inc: { totalOrders: 1, totalSpent: total, loyaltyPoints: Math.floor(total / 100) },
      }).exec().catch(() => {});
    }

    res.status(201).json({ orderId: order._id.toString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/my
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const orders = await Order.find({ userId: req.user!.id }).sort({ createdAt: -1 }).lean();
  res.json({ orders: orders.map(toOrder) });
});

// GET /api/orders/:id — requires auth; only order owner or admin may view
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    const isOwner = (order as any).userId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(toOrder(order));
  } catch {
    res.status(404).json({ error: 'Order not found' });
  }
});

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  if (!['pending', 'confirmed'].includes(order.status)) {
    res.status(400).json({ error: 'Order cannot be cancelled at this stage' }); return;
  }
  await Order.findByIdAndUpdate(order._id, {
    status: 'cancelled',
    $push: { timeline: { status: 'cancelled', timestamp: new Date(), note: 'Cancelled by customer' } },
  });
  res.json({ ok: true });
});

// GET /api/users/:userId/orders
router.get('/user/:userId', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
  res.json({ orders: orders.map(toOrder) });
});

// ── Admin ──
// GET /api/admin/orders
router.get('/admin/list', requireAdmin, async (req, res) => {
  const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ orders: orders.map(toOrder), total });
});

// PATCH /api/admin/orders/:id/status
router.patch('/admin/:id/status', requireAdmin, async (req, res) => {
  const { status, note } = req.body as { status: string; note?: string };
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status,
      $push: { timeline: { status, timestamp: new Date(), note: note ?? '' } },
    },
    { new: true }
  ).lean();
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json(toOrder(order));
});

function toOrder(o: Record<string, unknown> & { _id: { toString(): string } }) {
  const id = o._id.toString();
  return { ...o, id, _id: id };
}

export default router;
