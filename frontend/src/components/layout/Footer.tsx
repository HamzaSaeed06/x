import { Link } from 'wouter';
import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  RotateCcw,
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=electronics', label: 'Electronics' },
    { href: '/products?category=fashion', label: 'Fashion' },
    { href: '/products?category=home', label: 'Home & Living' },
    { href: '/products?category=beauty', label: 'Beauty' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQs' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns' },
    { href: '/track-order', label: 'Track Order' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/blog', label: 'Blog' },
  ],
};

const socialLinks = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Twitter, href: '#', label: 'Twitter' },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over PKR 5,000' },
  { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: CreditCard, title: 'Flexible Payment', desc: 'Multiple options' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Thanks for subscribing!');
    setEmail('');
    setIsSubscribing(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-neutral-950 text-white">
      {/* Features Strip */}
      <div className="border-b border-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="flex flex-col items-center sm:items-start text-center sm:text-left group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-neutral-900 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 group-hover:bg-neutral-800 transition-colors">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={1.5} />
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-white mb-0.5 sm:mb-1">
                  {feature.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-500 leading-snug">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="max-w-md text-center lg:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                Stay in the loop
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                Subscribe for exclusive offers, new arrivals, and style inspiration.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64 lg:w-72">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 sm:h-12 px-4 text-sm bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 rounded-lg sm:rounded-xl focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubscribing || !email}
                className="h-11 sm:h-12 px-5 sm:px-6 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-50 text-sm"
              >
                {isSubscribing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                    <span className="hidden xs:inline">Subscribing...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Subscribe
                    <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* Mobile Accordion Layout */}
        <div className="lg:hidden space-y-0 border-b border-neutral-800 mb-8">
          {/* Brand Section - Always Visible on Mobile */}
          <div className="pb-6 mb-6 border-b border-neutral-800">
            <Link href="/" className="inline-flex flex-col items-start leading-none group mb-4">
              <span className="text-xl sm:text-2xl font-black text-white tracking-[0.15em]">ZEST</span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 tracking-[0.25em] mt-1 group-hover:text-white transition-colors duration-300">
                & PARTNERS
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mb-4">
              Curated excellence for the modern lifestyle. Premium products, exceptional service.
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-900 rounded-lg sm:rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Accordion Sections for Mobile */}
          {(['shop', 'support', 'company'] as const).map((section) => (
            <div key={section} className="border-b border-neutral-800 last:border-b-0">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h4>
                <ChevronDown 
                  size={18} 
                  className={`text-neutral-500 transition-transform duration-200 ${
                    expandedSection === section ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  expandedSection === section ? 'max-h-64 pb-4' : 'max-h-0'
                }`}
              >
                <ul className="space-y-2.5">
                  {footerLinks[section].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowRight 
                          size={12} 
                          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" 
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Contact Section - Accordion on Mobile */}
          <div className="border-b border-neutral-800 last:border-b-0">
            <button
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Contact
              </h4>
              <ChevronDown 
                size={18} 
                className={`text-neutral-500 transition-transform duration-200 ${
                  expandedSection === 'contact' ? 'rotate-180' : ''
                }`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                expandedSection === 'contact' ? 'max-h-64 pb-4' : 'max-h-0'
              }`}
            >
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                  <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Email</p>
                    <a href="mailto:hello@zestpartners.com" className="hover:text-white transition-colors">
                      hello@zestpartners.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                  <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Phone</p>
                    <span>+92 300 1234567</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                  <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Locations</p>
                    <span>Karachi, Lahore, Islamabad</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 space-y-6">
            <Link href="/" className="inline-flex flex-col items-start leading-none group">
              <span className="text-2xl font-black text-white tracking-[0.15em]">ZEST</span>
              <span className="text-[10px] font-semibold text-neutral-500 tracking-[0.25em] mt-1 group-hover:text-white transition-colors duration-300">
                & PARTNERS
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Curated excellence for the modern lifestyle. Premium products, exceptional service.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {(['shop', 'support', 'company'] as const).map((section) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </h4>
              <ul className="space-y-3">
                {footerLinks[section].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowRight 
                        size={12} 
                        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" 
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Email</p>
                  <a href="mailto:hello@zestpartners.com" className="hover:text-white transition-colors">
                    hello@zestpartners.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Phone</p>
                  <span>+92 300 1234567</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Locations</p>
                  <span>Karachi, Lahore, Islamabad</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-xs text-neutral-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} ZEST & Partners. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6">
              <Link href="/privacy" className="text-[10px] sm:text-xs text-neutral-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[10px] sm:text-xs text-neutral-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-[10px] sm:text-xs text-neutral-500 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Area for iOS */}
      <div className="safe-area-inset-bottom bg-neutral-950" />
    </footer>
  );
}
