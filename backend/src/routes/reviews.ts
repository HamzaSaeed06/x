import { Router } from 'express';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { requireAuth, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/reviews/product/:productId
router.get('/product/:productId', optionalAuth, async (req, res) => {
  const reviews = await Review.find({
    productId: req.params.productId,
    isApproved: true,
  })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ reviews: reviews.map(toReview) });
});

// GET /api/reviews/check/:productId — check if current user can review this product
router.get('/check/:productId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId;

    const purchased = await Order.findOne({
      userId,
      status: 'delivered',
      'items.productId': productId,
    }).lean();

    const alreadyReviewed = await Review.findOne({ productId, userId }).lean();

    res.json({
      canReview: !!purchased && !alreadyReviewed,
      hasPurchased: !!purchased,
      hasReviewed: !!alreadyReviewed,
    });
  } catch {
    res.status(500).json({ error: 'Failed to check review eligibility' });
  }
});

// POST /api/reviews/product/:productId
router.post('/product/:productId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rating, title, body, images } = req.body as {
      rating: number;
      title?: string;
      body: string;
      images?: string[];
    };
    if (!rating || !body) {
      res.status(400).json({ error: 'Rating and review body are required' });
      return;
    }

    const alreadyReviewed = await Review.findOne({
      productId: req.params.productId,
      userId: req.user!.id,
    });
    if (alreadyReviewed) {
      res.status(409).json({ error: 'You have already reviewed this product' });
      return;
    }

    const purchasedOrder = await Order.findOne({
      userId: req.user!.id,
      status: 'delivered',
      'items.productId': req.params.productId,
    }).lean();
    const isVerifiedPurchase = !!purchasedOrder;

    const review = await Review.create({
      productId: req.params.productId,
      userId: req.user!.id,
      userName: req.body.userName ?? 'Customer',
      userAvatar: req.body.userAvatar,
      rating,
      title,
      body,
      images: images ?? [],
      isVerifiedPurchase,
    });

    const stats = await Review.aggregate([
      { $match: { productId: review.productId, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Product.findByIdAndUpdate(req.params.productId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    res.status(201).json(toReview(review.toObject()));
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// POST /api/reviews/:id/helpful — mark a review as helpful or unhelpful
router.post('/:id/helpful', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type } = req.body as { type: 'helpful' | 'unhelpful' };
    if (type !== 'helpful' && type !== 'unhelpful') {
      res.status(400).json({ error: 'type must be "helpful" or "unhelpful"' }); return;
    }
    const update = type === 'helpful'
      ? { $inc: { helpful: 1 } }
      : { $inc: { unhelpful: 1 } };
    const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!review) { res.status(404).json({ error: 'Review not found' }); return; }
    res.json({ helpful: review.helpful, unhelpful: (review as any).unhelpful ?? 0 });
  } catch {
    res.status(500).json({ error: 'Failed to update vote' });
  }
});

// PATCH /api/reviews/:id
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404).json({ error: 'Review not found' }); return; }
  if (review.userId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
  const { rating, title, body } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (body) review.body = body;
  await review.save();
  res.json(toReview(review.toObject()));
});

// DELETE /api/reviews/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404).json({ error: 'Review not found' }); return; }
  if (review.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  await review.deleteOne();
  res.json({ ok: true });
});

// GET /api/reviews/user/:userId
router.get('/user/:userId', requireAuth, async (req, res) => {
  const reviews = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
  res.json({ reviews: reviews.map(toReview) });
});

function toReview(r: any) {
  return { ...r, id: r._id.toString(), _id: r._id.toString() };
}

export default router;
