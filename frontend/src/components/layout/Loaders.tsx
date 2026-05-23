import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function GlobalSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-[9999]"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Loader2 className="w-full h-full text-neutral-900" strokeWidth={1.5} />
          </motion.div>
          <div className="w-2 h-2 rounded-full bg-neutral-900" />
        </div>
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium text-neutral-600"
        >
          Loading...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function ProductGridSkeleton() {
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="flex flex-col"
          variants={itemVariants}
        >
          <div className="bg-neutral-100 rounded-lg sm:rounded-xl lg:rounded-2xl aspect-[3/4] mb-3 animate-shimmer" />
          <div className="space-y-2">
            <div className="h-3 sm:h-4 bg-neutral-100 rounded w-3/4 animate-shimmer" />
            <div className="h-3 sm:h-4 bg-neutral-100 rounded w-1/2 animate-shimmer" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 sm:p-6 rounded-lg sm:rounded-xl bg-white border border-neutral-100"
    >
      <div className="space-y-4">
        <div className="h-6 bg-neutral-100 rounded-lg w-2/3 animate-shimmer" />
        <div className="space-y-2">
          <div className="h-4 bg-neutral-100 rounded w-full animate-shimmer" />
          <div className="h-4 bg-neutral-100 rounded w-5/6 animate-shimmer" />
          <div className="h-4 bg-neutral-100 rounded w-4/5 animate-shimmer" />
        </div>
      </div>
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-3"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg bg-white border border-neutral-100">
          <div className="h-10 w-10 bg-neutral-100 rounded animate-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-100 rounded w-1/3 animate-shimmer" />
            <div className="h-3 bg-neutral-100 rounded w-1/2 animate-shimmer" />
          </div>
          <div className="h-8 w-20 bg-neutral-100 rounded animate-shimmer flex-shrink-0" />
        </div>
      ))}
    </motion.div>
  );
}
