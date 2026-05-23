import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      toast.success('Thanks for subscribing!', {
        icon: <Check className="w-5 h-5 text-green-600" />,
      });
      
      setTimeout(() => {
        setEmail('');
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-12 sm:py-16 lg:py-20 bg-neutral-950 border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden rounded-none"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <span className="text-xs sm:text-sm font-bold text-accent uppercase tracking-wider">
              Stay Updated
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Subscribe for Exclusive Deals
          </h2>
          
          <p className="text-neutral-300 text-sm sm:text-base lg:text-lg max-w-lg mx-auto">
            Get early access to new collections, special promotions, and insider tips delivered to your inbox.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isSuccess}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-none bg-neutral-900 border-2 border-neutral-800 text-white placeholder:text-neutral-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.6)] focus:border-neutral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full sm:w-auto bg-amber-400 text-black hover:bg-amber-300 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none gap-2 font-bold h-[44px] sm:h-[52px] transition-all"
          >
            {isSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span className="hidden sm:inline">Subscribed!</span>
              </>
            ) : isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                <span className="hidden sm:inline">Subscribing...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-center sm:text-left"
        >
          {[
            '✓ Early Access to Sales',
            '✓ Exclusive Discounts',
            '✓ New Arrivals First',
          ].map((benefit, i) => (
            <motion.p
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-sm sm:text-base text-neutral-300"
            >
              {benefit}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
