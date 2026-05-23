import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { useRouter } from '@/hooks/useNextRouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  Search,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
  Sparkles,
  Home,
  Grid3X3,
  Tag,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/services/authService';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const TRENDING_SEARCHES = [
  'Sneakers',
  'Summer Dress',
  'Wireless Headphones',
  'Skincare',
  'Laptop Bag',
  'Watch',
];

const NAVIGATION_LINKS = [
  { href: '/products', label: 'Shop All', icon: Grid3X3 },
  { href: '/products?sort=popular', label: 'Trending', icon: TrendingUp },
  { href: '/products?sort=newest', label: 'New In', icon: Zap },
  { href: '/products?category=fashion', label: 'Fashion', icon: Tag },
  { href: '/products?category=electronics', label: 'Tech', icon: Tag },
];

const RECENT_KEY = 'zest_recent_searches';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const existing = getRecentSearches().filter(q => q !== query);
    const updated = [query, ...existing].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

interface SearchDropdownProps {
  query: string;
  onSelect: (q: string) => void;
  isMobile?: boolean;
}

function SearchDropdown({ query, onSelect, isMobile = false }: SearchDropdownProps) {
  const [recent, setRecent] = useState<string[]>(() => getRecentSearches());

  const suggestions = query.length > 1
    ? TRENDING_SEARCHES.filter(t => t.toLowerCase().includes(query.toLowerCase()))
    : [];

  const showTrending = query.length === 0;
  const showRecent = query.length === 0 && recent.length > 0;
  const hasSomething = suggestions.length > 0 || showTrending || showRecent;

  if (!hasSomething) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`absolute top-full left-0 right-0 mt-3 bg-white border border-neutral-200 shadow-2xl overflow-hidden z-50 ${
        isMobile ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      {suggestions.length > 0 && (
        <div className="p-2 sm:p-3">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-2">
            Suggestions
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => onSelect(s)}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg sm:rounded-xl transition-colors text-left group"
            >
              <Search size={14} className="text-neutral-400 group-hover:text-neutral-600 transition-colors flex-shrink-0" />
              <span className="truncate">
                {s.toLowerCase().indexOf(query.toLowerCase()) !== -1 ? (
                  <>
                    {s.slice(0, s.toLowerCase().indexOf(query.toLowerCase()))}
                    <strong className="text-neutral-900 font-semibold">
                      {s.slice(s.toLowerCase().indexOf(query.toLowerCase()), s.toLowerCase().indexOf(query.toLowerCase()) + query.length)}
                    </strong>
                    {s.slice(s.toLowerCase().indexOf(query.toLowerCase()) + query.length)}
                  </>
                ) : s}
              </span>
            </button>
          ))}
        </div>
      )}

      {showRecent && (
        <div className="p-2 sm:p-3 border-t border-neutral-100">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Recent</p>
            <button
              onMouseDown={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
              className="text-[10px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Clear all
            </button>
          </div>
          {recent.map((r) => (
            <button
              key={r}
              onMouseDown={() => onSelect(r)}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg sm:rounded-xl transition-colors text-left group"
            >
              <Clock size={14} className="text-neutral-400 flex-shrink-0" />
              <span className="truncate">{r}</span>
            </button>
          ))}
        </div>
      )}

      {showTrending && (
        <div className="p-2 sm:p-3 border-t border-neutral-100">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-2 sm:mb-3">
            Trending Now
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 px-2">
            {TRENDING_SEARCHES.slice(0, isMobile ? 4 : 6).map((t) => (
              <button
                key={t}
                onMouseDown={() => onSelect(t)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-[10px] sm:text-xs font-semibold rounded-full transition-all duration-200"
              >
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-neutral-100 p-2 sm:p-3">
        <button
          onMouseDown={() => onSelect(query || '')}
          className="w-full flex items-center justify-between text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-2 px-2 rounded-lg sm:rounded-xl hover:bg-neutral-50"
        >
          <span className="truncate">{query ? `Search for "${query}"` : 'Browse all products'}</span>
          <ArrowRight size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
        </button>
      </div>
    </motion.div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [location] = useLocation();
  const { items, openCart } = useCartStore();
  const { user, role, logout } = useAuthStore();
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const doSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      router.push('/products');
    } else {
      saveRecentSearch(trimmed);
      router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    }
    setSearchQuery('');
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchQuery);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      logout();
      setUserMenuOpen(false);
      router.push('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Error signing out');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-neutral-900 text-white text-center py-2 sm:py-2.5 px-3 sm:px-4 font-medium tracking-wide safe-area-inset-top">
        <span className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <Sparkles size={10} className="sm:w-3 sm:h-3 text-amber-400" />
          <span className="truncate">Free shipping on orders over PKR 5,000 — Limited time</span>
        </span>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-neutral-100'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-neutral-900 tracking-[0.12em] sm:tracking-[0.15em]">
                  ZEST
                </span>
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-semibold text-neutral-400 tracking-[0.2em] sm:tracking-[0.25em] mt-0.5 group-hover:text-neutral-900 transition-colors duration-300">
                  & PARTNERS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    location === link.href || (link.href !== '/products' && location.startsWith(link.href))
                      ? 'text-neutral-900 bg-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search — Desktop */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-4 lg:mx-6 relative">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full group">
                  <Search 
                    className={`absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${
                      searchFocused ? 'text-neutral-900' : 'text-neutral-400'
                    }`} 
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    className="w-full pl-9 lg:pl-11 pr-4 h-10 lg:h-11 text-sm border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all duration-200 rounded-lg lg:rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-full transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>
              <AnimatePresence>
                {searchFocused && (
                  <SearchDropdown query={searchQuery} onSelect={doSearch} />
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen(o => !o)}
                className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-lg sm:rounded-xl transition-colors"
                aria-label="Search"
              >
                <Search size={18} className="sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-lg sm:rounded-xl transition-colors relative group"
              >
                <Heart size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              </Link>

              {/* Notifications */}
              <div className="hidden xs:block">
                <NotificationBell />
              </div>

              {/* Cart */}
              <motion.button
                onClick={openCart}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-lg sm:rounded-xl transition-colors relative group"
                whileTap={{ scale: 0.95 }}
                aria-label="Open cart"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                <AnimatePresence mode="wait">
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums shadow-sm"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 sm:h-6 bg-neutral-200 mx-1 sm:mx-2" />

              {/* User Menu */}
              {user ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 text-neutral-600 hover:text-neutral-900 transition-colors rounded-lg sm:rounded-xl hover:bg-neutral-100"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm overflow-hidden ring-2 ring-white shadow-sm">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        user.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden md:block text-xs sm:text-sm font-medium max-w-[60px] lg:max-w-[80px] truncate">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-white shadow-xl border border-neutral-100 rounded-xl sm:rounded-2xl py-2 z-50 overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-neutral-100">
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">{user.displayName || 'User'}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{user.email}</p>
                          {(user.loyaltyPoints ?? 0) > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1">
                                {user.loyaltyPoints} points
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            href="/account/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                          >
                            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> My Orders
                          </Link>

                          {role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-900 font-semibold hover:bg-neutral-50 transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Admin Dashboard
                            </Link>
                          )}

                          <Link
                            href="/account/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Settings
                          </Link>
                        </div>

                        <div className="border-t border-neutral-100 pt-1">
                          <button 
                            onClick={handleSignOut} 
                            className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                >
                  <Link
                    href="/auth/login"
                    onClick={() => {
                      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      document.cookie = 'auth-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    }}
                  >
                    <User size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline ml-1.5">Sign In</span>
                  </Link>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 text-neutral-700 lg:hidden hover:bg-neutral-100 rounded-lg sm:rounded-xl transition-colors ml-0.5 sm:ml-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-neutral-100 md:hidden bg-white"
            >
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 relative">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      autoFocus
                      className="w-full pl-9 sm:pl-11 pr-9 sm:pr-10 h-10 sm:h-12 text-sm border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-lg sm:rounded-xl transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-neutral-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </form>
                <AnimatePresence>
                  {searchFocused && (
                    <SearchDropdown query={searchQuery} onSelect={doSearch} isMobile />
                  )}
                </AnimatePresence>
              </div>

              {/* Quick search tags */}
              {!searchQuery && (
                <div className="px-3 sm:px-4 pb-2.5 sm:pb-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {TRENDING_SEARCHES.slice(0, 4).map(t => (
                    <button
                      key={t}
                      onClick={() => doSearch(t)}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-neutral-100 text-neutral-700 text-[10px] sm:text-xs font-semibold rounded-full hover:bg-neutral-900 hover:text-white transition-all duration-200"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-white z-50 lg:hidden shadow-2xl overflow-y-auto safe-area-inset-right"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
                  <Link href="/" className="flex flex-col items-start leading-none" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-lg font-black text-neutral-900 tracking-[0.12em]">ZEST</span>
                    <span className="text-[7px] font-semibold text-neutral-400 tracking-[0.2em] mt-0.5">& PARTNERS</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-xl transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Info (if logged in) */}
                {user && (
                  <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden ring-2 ring-white shadow-sm">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          user.displayName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-neutral-900 truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        {(user.loyaltyPoints ?? 0) > 0 && (
                          <span className="inline-flex mt-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                            {user.loyaltyPoints} points
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Shop</p>
                  <nav className="space-y-0.5">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 py-3 px-3 text-sm font-medium rounded-xl transition-colors ${
                        location === '/'
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Home size={18} className="text-neutral-500" />
                      Home
                    </Link>
                    {NAVIGATION_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between py-3 px-3 text-sm font-medium rounded-xl transition-colors ${
                          location === link.href || (link.href !== '/products' && location.includes(link.href.split('?')[0]))
                            ? 'bg-neutral-100 text-neutral-900'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <link.icon size={18} className="text-neutral-500" />
                          {link.label}
                        </span>
                        <ArrowRight size={14} className="text-neutral-400" />
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Quick Links */}
                <div className="px-4 py-3 border-t border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Quick Links</p>
                  <div className="space-y-0.5">
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                    >
                      <Heart size={18} className="text-neutral-500" />
                      Wishlist
                    </Link>
                    
                    {user ? (
                      <>
                        <Link
                          href="/account/orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-3 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                        >
                          <Package size={18} className="text-neutral-500" />
                          My Orders
                        </Link>
                        <Link
                          href="/account/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-3 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                        >
                          <Settings size={18} className="text-neutral-500" />
                          Settings
                        </Link>
                        {role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 py-3 px-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors"
                          >
                            <LayoutDashboard size={18} className="text-neutral-500" />
                            Admin Dashboard
                          </Link>
                        )}
                      </>
                    ) : (
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-3 px-3 text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors mt-2"
                      >
                        <User size={18} />
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>

                {/* Sign Out (if logged in) */}
                {user && (
                  <div className="p-4 border-t border-neutral-100 mt-auto">
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                )}

                {/* Bottom Safe Area */}
                <div className="safe-area-inset-bottom" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
