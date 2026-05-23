import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, ChevronRight, Shield, BarChart2, Megaphone, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'zest_cookie_consent';

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  essential: boolean;
  timestamp: number;
}

const defaultPrefs: CookiePreferences = {
  analytics: false,
  marketing: false,
  preferences: false,
  essential: true,
  timestamp: 0,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(defaultPrefs);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
    try {
      setPrefs(JSON.parse(saved));
    } catch {
      setShowBanner(true);
    }
  }, []);

  const save = (partial: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = { ...prefs, ...partial, essential: true, timestamp: Date.now() };
    setPrefs(updated);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    if (updated.analytics) initializeAnalytics();
    if (updated.marketing) initializeMarketing();
    setShowBanner(false);
    setShowModal(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: true, preferences: true });
  const rejectAll = () => save({ analytics: false, marketing: false, preferences: false });
  const saveCustom = () => save(prefs);

  const toggle = (key: keyof Omit<CookiePreferences, 'essential' | 'timestamp'>) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const PREF_ITEMS = [
    {
      key: 'analytics' as const,
      icon: BarChart2,
      label: 'Analytics',
      desc: 'Help us understand how you use our site to improve performance.',
    },
    {
      key: 'marketing' as const,
      icon: Megaphone,
      label: 'Marketing',
      desc: 'Allow personalised ads and promotional content based on your activity.',
    },
    {
      key: 'preferences' as const,
      icon: Settings2,
      label: 'Preferences',
      desc: 'Remember your settings and choices for a personalised experience.',
    },
  ];

  return (
    <>
      {/* ── Bottom Bar ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            key="cookie-bar"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-neutral-900 shadow-[0_-4px_0_0_rgba(0,0,0,0.08)] safe-area-inset-bottom"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                {/* Icon + Text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-neutral-900 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Cookie className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-neutral-900">
                      We use cookies
                    </p>
                    <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed mt-0.5 line-clamp-2 sm:line-clamp-1">
                      We use cookies to enhance your experience and analyse site traffic.{' '}
                      <button
                        onClick={() => { setShowModal(true); }}
                        className="underline text-neutral-700 hover:text-neutral-900 transition-colors font-medium"
                      >
                        Learn more
                      </button>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors px-2 py-1.5 whitespace-nowrap"
                  >
                    Customise
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={rejectAll}
                    className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-bold border-2 border-neutral-900 text-neutral-700 bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptAll}
                    className="h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-bold border-2 border-neutral-900 text-white bg-neutral-900 hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Customise Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[60]"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-6 sm:w-full sm:max-w-md z-[70] bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-neutral-900">
                <Shield className="w-4 h-4 text-neutral-700 flex-shrink-0" />
                <h3 className="text-sm font-bold text-neutral-900 flex-1">Privacy Preferences</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
                {/* Essential — always on */}
                <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0 bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-neutral-900">Essential Cookies</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Required for site functionality. Always active.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 mt-0.5 whitespace-nowrap">Always on</span>
                </div>

                {PREF_ITEMS.map(({ key, icon: Icon, label, desc }) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 p-3 border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={() => toggle(key)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                        prefs[key]
                          ? 'bg-neutral-900 border-neutral-900'
                          : 'bg-white border-neutral-300 group-hover:border-neutral-600'
                      }`}
                    >
                      {prefs[key] && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-neutral-500" />
                        <p className="text-xs font-bold text-neutral-900">{label}</p>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 px-5 py-4 border-t-2 border-neutral-900 bg-neutral-50">
                <button
                  onClick={rejectAll}
                  className="flex-1 h-9 text-xs font-bold border-2 border-neutral-900 text-neutral-700 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Reject All
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 h-9 text-xs font-bold border-2 border-neutral-900 text-white bg-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 h-9 text-xs font-bold border-2 border-neutral-900 text-neutral-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Accept All
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function initializeAnalytics() {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', { analytics_storage: 'granted' });
  }
}

function initializeMarketing() {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }
}
