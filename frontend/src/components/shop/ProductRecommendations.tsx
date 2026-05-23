import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { getRecommendedProducts } from '@/lib/services/productService';
import type { Product } from '@/types';

interface ProductRecommendationsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  variant?: 'homepage' | 'product-page' | 'cart-page';
}

export function ProductRecommendations({
  title = 'You Might Also Like',
  subtitle = 'Personalized recommendations based on your browsing',
  limit = 4,
  variant = 'homepage',
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRecommendedProducts(limit)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (!loading && products.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <section className="py-12 sm:py-16 lg:py-20 border-t border-neutral-200">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-3 sm:mb-4"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <span className="text-xs sm:text-sm font-bold text-accent uppercase tracking-wider">
                {variant === 'homepage' ? 'For You' : 'Similar Products'}
              </span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-950">
              {title}
            </h2>
            {subtitle && (
              <p className="text-neutral-600 text-sm sm:text-base mt-2 sm:mt-3">
                {subtitle}
              </p>
            )}
          </div>
          {variant === 'homepage' && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="self-start sm:self-auto gap-2"
            >
              <Link href="/products">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from({ length: limit }).map((_, i) => (
              <motion.div
                key={i}
                className="space-y-3 sm:space-y-4"
                variants={itemVariants}
              >
                <div className="aspect-[3/4] bg-neutral-100 rounded-lg sm:rounded-xl lg:rounded-2xl animate-shimmer" />
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-100 rounded w-2/3 animate-shimmer" />
                  <div className="h-4 bg-neutral-100 rounded w-full animate-shimmer" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA for cart page variant */}
        {variant === 'cart-page' && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-10 lg:mt-12 text-center"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-full"
            >
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
