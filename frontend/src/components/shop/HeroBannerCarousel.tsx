import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Banner } from '@/types';

interface Slide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

interface HeroBannerCarouselProps {
  banners: Banner[];
}

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'Summer Collection',
    subtitle: 'Discover the essence of modern elegance. Curated pieces for the contemporary lifestyle.',
    ctaText: 'Shop Now',
    ctaLink: '/products?category=fashion',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80',
  },
  {
    title: 'Tech Essentials',
    subtitle: 'Premium gadgets and accessories designed for those who demand excellence.',
    ctaText: 'Explore Tech',
    ctaLink: '/products?category=electronics',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1800&q=80',
  },
  {
    title: 'Home & Living',
    subtitle: 'Transform your space with carefully selected pieces that inspire.',
    ctaText: 'View Collection',
    ctaLink: '/products?category=home',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=80',
  },
];

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const slides: Slide[] = banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goTo = useCallback((idx: number, dir?: number) => {
    if (idx === current) return;
    setDirection(dir ?? (idx > current ? 1 : -1));
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [isAutoPlaying, slides.length, next]);

  const slide = slides[current];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <section 
      className="relative min-h-[420px] h-[52vh] sm:h-[580px] lg:h-[680px] xl:h-[720px] overflow-hidden bg-neutral-950"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Images with Animation */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
          }}
          className="absolute inset-0"
        >
          <img 
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xs xs:max-w-sm sm:max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Badge */}
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase rounded-full border border-white/20 mb-4 sm:mb-6"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  New Collection
                </motion.span>

                {/* Title */}
                <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.05] mb-3 sm:mb-6">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed mb-5 sm:mb-8 max-w-xs sm:max-w-md">
                  {slide.subtitle}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Button
                    asChild
                    className="h-10 sm:h-12 lg:h-14 px-6 sm:px-8 lg:px-10 bg-white text-neutral-900 hover:bg-neutral-100 text-xs sm:text-sm lg:text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Link href={slide.ctaLink}>
                      {slide.ctaText}
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/60 text-xs sm:text-sm lg:text-base font-semibold rounded-full transition-all duration-300"
                  >
                    <Link href="/products">
                      Explore All
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className="group relative"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current 
                    ? 'w-10 bg-white' 
                    : 'w-1.5 bg-white/40 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-30 hidden sm:flex items-center gap-2 text-white/60 text-sm font-medium">
        <span className="text-white text-lg font-bold">{String(current + 1).padStart(2, '0')}</span>
        <span>/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}
