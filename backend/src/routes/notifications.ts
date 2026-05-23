import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const notifications = await Notification.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({
    notifications: notifications.map(n => ({ ...n, id: (n._id as { toString(): string }).toString() })),
  });
});

// POST /api/notifications
// Only admins may supply targetUserId; other users always notify themselves
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, message, type, link, targetUserId } = req.body as {
    title: string;
    message: string;
    type?: string;
    link?: string;
    targetUserId?: string;
  };
  const recipientId =
    req.user!.role === 'admin' && targetUserId ? targetUserId : req.user!.id;
  const n = await Notification.create({
    userId: recipientId,
    title,
    message,
    type: type ?? 'system',
    link,
  });
  res.status(201).json({ ...n.toObject(), id: n._id.toString() });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { isRead: true }
  );
  res.json({ ok: true });
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, async (req: AuthRequest, res) => {
  await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true });
  res.json({ ok: true });
});

export default router;
