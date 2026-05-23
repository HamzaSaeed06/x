import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Zap,
  Star,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroBannerCarousel } from '@/components/shop/HeroBannerCarousel';
import { FlashSaleCountdown } from '@/components/shop/FlashSaleCountdown';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { Button } from '@/components/ui/button';
import {
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
} from '@/lib/services/productService';
import { getStoreSettings } from '@/lib/services/storeSettingsService';
import type { Product, StoreSettings } from '@/types';

// Animation variants for stagger effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  link,
  badge,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  link?: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
      <div>
        {badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3 sm:mb-4">
            {Icon && <Icon size={14} />}
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-950 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-600 text-sm sm:text-base md:text-lg mt-2 sm:mt-3 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {link && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="group self-start sm:self-auto h-10 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold"
        >
          <Link href={link}>
            View All
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-7">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 sm:space-y-4">
            <div className="aspect-[3/4] bg-neutral-150 rounded-lg sm:rounded-xl lg:rounded-2xl animate-shimmer" />
            <div className="space-y-2 sm:space-y-3 px-1">
              <div className="h-3 bg-neutral-150 rounded w-1/3 animate-shimmer" />
              <div className="h-4 bg-neutral-150 rounded w-3/4 animate-shimmer" />
              <div className="h-4 bg-neutral-150 rounded w-1/2 animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20">
        <p className="text-neutral-500 text-sm sm:text-base">Check back later for new products!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-7"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {products.map((p) => (
        <motion.div key={p.id} variants={itemVariants}>
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

const categories = [
  { 
    name: 'Electronics', 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', 
    slug: 'electronics',
    count: '200+ items',
  },
  { 
    name: 'Fashion', 
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', 
    slug: 'fashion',
    count: '350+ items',
  },
  { 
    name: 'Home & Living', 
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', 
    slug: 'home',
    count: '180+ items',
  },
  { 
    name: 'Beauty', 
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', 
    slug: 'beauty',
    count: '120+ items',
  },
];

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders over PKR 5,000',
    color: 'bg-neutral-900 text-white',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day hassle-free returns',
    color: 'bg-neutral-100 text-neutral-800',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    desc: 'Multiple payment options',
    color: 'bg-neutral-800 text-white',
  },
  {
    icon: CreditCard,
    title: 'Premium Quality',
    desc: 'Curated with care',
    color: 'bg-neutral-200 text-neutral-800',
  },
];

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrendingProducts(8),
      getFeaturedProducts(4),
      getNewArrivals(4),
      getStoreSettings(),
    ])
      .then(([t, f, n, s]) => {
        setTrending(t);
        setFeatured(f);
        setNewArrivals(n);
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <HeroBannerCarousel banners={settings?.banners ?? []} />

      {/* Features Bar */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-center sm:text-left p-4 bg-white border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm sm:text-base text-neutral-900">{feature.title}</p>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-32">

        {/* Category Grid */}
        <section>
          <SectionHeader 
            title="Shop by Category" 
            subtitle="Explore our curated collections"
            badge="Categories"
            icon={Sparkles}
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-7">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={`/products?category=${cat.slug}`}>
                  <div className="relative overflow-hidden rounded-none group cursor-pointer aspect-[4/5] sm:aspect-[4/5] bg-neutral-100 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-300">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 category-image"
                      loading="lazy"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-3 sm:p-4 lg:p-5 flex flex-col justify-end z-20">
                      <span className="text-white/70 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">
                        {cat.count}
                      </span>
                      <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg xl:text-xl leading-tight">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-white text-xs sm:text-sm font-medium opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span>Shop Now</span>
                        <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        {settings?.flashSaleBannerActive && (
          <section className="bg-neutral-950 py-10 sm:py-14 md:py-16 lg:py-20 border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full mb-2 sm:mb-3">
                    <Zap size={10} className="sm:w-3 sm:h-3 text-amber-400" />
                    Limited Time
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    {settings.flashSaleBannerTitle ?? 'Flash Sale'}
                  </h2>
                  {settings.flashSaleBannerSubtitle && (
                    <p className="text-white/60 text-xs sm:text-sm mt-1 sm:mt-2">
                      {settings.flashSaleBannerSubtitle}
                    </p>
                  )}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-neutral-900 hover:bg-neutral-100 self-start sm:self-auto h-9 sm:h-10 text-xs sm:text-sm rounded-none border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] transition-all"
                >
                  <Link href="/products?sort=flash-sale">
                    Shop All Deals
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                  </Link>
                </Button>
              </div>
              <FlashSaleCountdown />
            </div>
          </section>
        )}

        {/* Trending Products */}
        <section>
          <SectionHeader
            title="Trending Now"
            subtitle="Our most-loved products this week"
            badge="Popular"
            icon={TrendingUp}
            link="/products?sort=popular"
          />
          <ProductGrid products={trending} loading={loading} />
        </section>

        {/* Promo Banner */}
        <section className="relative overflow-hidden rounded-none bg-neutral-50 border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-6 sm:p-10 md:p-12 lg:p-14 xl:p-16 flex flex-col justify-center order-2 lg:order-1">
              <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-none mb-4 sm:mb-6 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Star size={14} className="fill-white" />
                Exclusive
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-neutral-950 tracking-tight leading-tight mb-3 sm:mb-5">
                Get 20% Off
                <br />
                <span className="text-neutral-500">Your First Order</span>
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md leading-relaxed">
                Join our community and enjoy exclusive benefits, early access to sales, and personalized recommendations.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <Button asChild size="lg" className="h-11 sm:h-12 text-sm sm:text-base rounded-none border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Link href="/auth/signup">
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 sm:h-12 text-sm sm:text-base rounded-none border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Link href="/products">
                    Browse Products
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-44 sm:h-56 md:h-72 lg:h-auto order-1 lg:order-2 min-h-[180px]">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                alt="Promotional banner"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-neutral-50/90 via-neutral-50/30 to-transparent" />
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        {(loading || featured.length > 0) && (
          <section>
            <SectionHeader
              title="Featured Collection"
              subtitle="Hand-picked by our editors"
              badge="Editor&apos;s Pick"
              icon={Sparkles}
              link="/products?sort=featured"
            />
            <ProductGrid products={featured} loading={loading} />
          </section>
        )}

        {/* New Arrivals */}
        {(loading || newArrivals.length > 0) && (
          <section>
            <SectionHeader
              title="New Arrivals"
              subtitle="Fresh in — just added this week"
              badge="New In"
              icon={Clock}
              link="/products?sort=newest"
            />
            <ProductGrid products={newArrivals} loading={loading} />
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Testimonials / Trust Badges */}
        <section className="border-t border-neutral-200 pt-16 sm:pt-20 lg:pt-24">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 mb-4 sm:mb-5">
              Trusted by Thousands
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg max-w-lg mx-auto">
              Join our community of satisfied customers
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '4.9', label: 'Average Rating' },
              { value: '500+', label: 'Products' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-4 sm:p-6 bg-white border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 mb-1 sm:mb-2">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-neutral-500 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
