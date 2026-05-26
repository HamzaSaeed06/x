import { Router } from 'express';
import { Product } from '../models/Product.js';
import { optionalAuth, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { mockProducts } from '../data/mockData.js';
import mongoose from 'mongoose';

const router = Router();

function isMongoDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// GET /api/products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, subcategory, sort, limit = '24', page = '1', q } = req.query as Record<string, string>;

    if (!isMongoDBConnected()) {
      return handleMockProducts(res, mockProducts, category, sort, parseInt(limit), parseInt(page), q);
    }

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
    return handleMockProducts(res, mockProducts, req.query.category as string, req.query.sort as string, parseInt(req.query.limit as string || '24'), parseInt(req.query.page as string || '1'), req.query.q as string);
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '4');
  if (!isMongoDBConnected()) {
    const products = mockProducts.filter(p => p.isFeatured).slice(0, limit);
    return res.json({ products: products.map(toMockProduct) });
  }
  try {
    const products = await Product.find({ isActive: true, isFeatured: true }).sort({ sold: -1 }).limit(limit).lean();
    res.json({ products: products.map(toProduct) });
  } catch {
    const products = mockProducts.filter(p => p.isFeatured).slice(0, limit);
    res.json({ products: products.map(toMockProduct) });
  }
});

// GET /api/products/trending
router.get('/trending', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '8');
  if (!isMongoDBConnected()) {
    const products = mockProducts.sort((a, b) => b.sold - a.sold).slice(0, limit);
    return res.json({ products: products.map(toMockProduct) });
  }
  try {
    const products = await Product.find({ isActive: true }).sort({ sold: -1, views: -1 }).limit(limit).lean();
    res.json({ products: products.map(toProduct) });
  } catch {
    const products = mockProducts.sort((a, b) => b.sold - a.sold).slice(0, limit);
    res.json({ products: products.map(toMockProduct) });
  }
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '4');
  if (!isMongoDBConnected()) {
    const products = mockProducts.slice(0, limit);
    return res.json({ products: products.map(toMockProduct) });
  }
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ products: products.map(toProduct) });
  } catch {
    const products = mockProducts.slice(0, limit);
    res.json({ products: products.map(toMockProduct) });
  }
});

// GET /api/products/flash-sale
router.get('/flash-sale', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '8');
  if (!isMongoDBConnected()) {
    const products = mockProducts.filter(p => p.isFlashSale).slice(0, limit);
    return res.json({ products: products.map(toMockProduct) });
  }
  try {
    const products = await Product.find({ isActive: true, isFlashSale: true }).sort({ sold: -1 }).limit(limit).lean();
    res.json({ products: products.map(toProduct) });
  } catch {
    const products = mockProducts.filter(p => p.isFlashSale).slice(0, limit);
    res.json({ products: products.map(toMockProduct) });
  }
});

// GET /api/products/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (!isMongoDBConnected()) {
    const product = mockProducts.find(p => p.slug === slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(toMockProduct(product));
  }
  try {
    const product = await Product.findOne({ slug, isActive: true }).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec().catch(() => {});
    res.json(toProduct(product));
  } catch {
    const product = mockProducts.find(p => p.slug === slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(toMockProduct(product));
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isMongoDBConnected()) {
    const product = mockProducts.find(p => p._id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(toMockProduct(product));
  }
  try {
    const product = await Product.findById(id).lean();
    if (!product) res.status(404).json({ error: 'Product not found' });
    else res.json(toProduct(product));
  } catch {
    const product = mockProducts.find(p => p._id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(toMockProduct(product));
  }
});

// POST /api/products/:id/view
router.post('/:id/view', async (req, res) => {
  if (!isMongoDBConnected()) return res.json({ ok: true });
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

function handleMockProducts(
  res: any,
  products: any[],
  category?: string,
  sort?: string,
  limit: number = 24,
  page: number = 1,
  q?: string
) {
  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
    );
  }

  if (sort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    filtered.sort((a, b) => (b.sold + b.views) - (a.sold + a.views));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'featured') {
    filtered = filtered.filter(p => p.isFeatured);
  } else if (sort === 'flash-sale') {
    filtered = filtered.filter(p => p.isFlashSale);
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  res.json({ products: paginated.map(toMockProduct), total });
}

// Helper
function toProduct(p: Record<string, unknown> & { _id: { toString(): string }; createdAt?: Date }) {
  const id = p._id.toString();
  return { ...p, id, uid: id, _id: id };
}

function toMockProduct(p: any) {
  return { ...p, id: p._id, uid: p._id };
}

export default router;
