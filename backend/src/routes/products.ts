import { Router } from 'express';
import { Product } from '../models/Product.js';
import { optionalAuth, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, subcategory, sort, limit = '24', page = '1', q } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    if (subcategory) filter.subcategory = subcategory;
    if (q) filter.$text = { $search: q };

    let sortObj: any = { createdAt: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'popular') sortObj = { sold: -1, views: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'featured') { filter.isFeatured = true; }
    else if (sort === 'flash-sale') { filter.isFlashSale = true; }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ products: products.map(toProduct), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', products: [] });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '4');
  const products = await Product.find({ isActive: true, isFeatured: true }).sort({ sold: -1 }).limit(limit).lean();
  res.json({ products: products.map(toProduct) });
});

// GET /api/products/trending
router.get('/trending', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '8');
  const products = await Product.find({ isActive: true }).sort({ sold: -1, views: -1 }).limit(limit).lean();
  res.json({ products: products.map(toProduct) });
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '4');
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ products: products.map(toProduct) });
});

// GET /api/products/flash-sale
router.get('/flash-sale', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '8');
  const products = await Product.find({ isActive: true, isFlashSale: true }).sort({ sold: -1 }).limit(limit).lean();
  res.json({ products: products.map(toProduct) });
});

// GET /api/products/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
  // Increment views async
  Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec().catch(() => {});
  res.json(toProduct(product));
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
    res.json(toProduct(product));
  } catch {
    res.status(404).json({ error: 'Product not found' });
  }
});

// POST /api/products/:id/view
router.post('/:id/view', async (req, res) => {
  Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec().catch(() => {});
  res.json({ ok: true });
});

// --- Admin routes ---

// GET /api/admin/products
router.get('/admin/list', requireAdmin, async (req, res) => {
  const { sort, limit = '20', page = '1', q, category } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ products: products.map(toProduct), total });
});

// Helper
function toProduct(p: Record<string, unknown> & { _id: { toString(): string }; createdAt?: Date }) {
  const id = p._id.toString();
  return { ...p, id, uid: id, _id: id };
}

export default router;
