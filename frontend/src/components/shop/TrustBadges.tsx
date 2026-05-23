import { motion } from 'framer-motion';
import {
  Shield,
  Truck,
  RotateCcw,
  Headphones,
  Lock,
  Award,
  CreditCard,
  Globe,
} from 'lucide-react';

interface TrustBadge {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const TRUST_BADGES: TrustBadge[] = [
  {
    icon: Shield,
    title: 'Secure Checkout',
    description: '100% secure payment processing',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Free delivery on orders over PKR 5,000',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer service team',
    color: 'from-orange-500 to-orange-600',
  },
];

const CERTIFICATIONS = [
  {
    icon: Lock,
    title: 'SSL Encrypted',
    description: 'Bank-level security',
  },
  {
    icon: Award,
    title: '4.9★ Trusted',
    description: '50K+ reviews',
  },
  {
    icon: CreditCard,
    title: 'Multi-Payment',
    description: 'All major cards accepted',
  },
  {
    icon: Globe,
    title: 'International',
    description: 'Ship to 100+ countries',
  },
];

export function TrustBadges({ variant = 'minimal' }: { variant?: 'full' | 'minimal' }) {
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
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        className="py-8 sm:py-12 border-y border-neutral-200"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
          >
            {CERTIFICATIONS.map((cert) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={cert.title}
                  className="flex flex-col items-center text-center"
                  variants={itemVariants}
                >
                  <div className="p-3 rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-neutral-50 mb-3 transition-colors">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-900" />
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-neutral-900">
                    {cert.title}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    {cert.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 mb-4">
            Why Customers Trust Us
          </h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience, backed by our promises and guarantees.
          </p>
        </motion.div>

        {/* Main Trust Badges */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                className="group relative bg-white rounded-none p-8 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-300"
                variants={itemVariants}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 rounded-none bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br ${badge.color} p-3 mb-4 flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mb-2">
                    {badge.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-neutral-200 pt-12 sm:pt-16"
        >
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-xl sm:text-2xl font-bold text-neutral-950 mb-8 sm:mb-12"
          >
            Our Certifications & Partnerships
          </motion.h3>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {CERTIFICATIONS.map((cert) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={cert.title}
                  className="flex flex-col items-center text-center p-4 rounded-none border-2 border-transparent hover:border-neutral-900 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 transition-all duration-200"
                  variants={itemVariants}
                >
                  <div className="p-4 rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-neutral-100 mb-3">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-900" />
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-neutral-900">
                    {cert.title}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    {cert.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 p-8 sm:p-12 bg-neutral-50 rounded-none border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center"
        >
          <p className="text-lg sm:text-xl font-bold text-neutral-950 mb-2">
            Not satisfied? We'll refund you.
          </p>
          <p className="text-neutral-600 text-sm sm:text-base">
            If you're not completely happy with your purchase, we offer a full refund within 30 days, no questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
