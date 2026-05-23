import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'zest_cookie_consent';

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  essential: boolean; // Always required
  timestamp: number;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false,
    preferences: false,
    essential: true,
    timestamp: Date.now(),
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: Partial<CookiePreferences>) => {
    const updated = { ...preferences, ...prefs, timestamp: Date.now() };
    setPreferences(updated);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    
    // Trigger analytics or tracking based on preferences
    if (updated.analytics) {
      initializeAnalytics();
    }
    if (updated.marketing) {
      initializeMarketing();
    }
    
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      analytics: true,
      marketing: true,
      preferences: true,
      essential: true,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      analytics: false,
      marketing: false,
      preferences: false,
      essential: true,
    });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const togglePreference = (key: keyof Omit<CookiePreferences, 'essential' | 'timestamp'>) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence mode="wait">
      {showBanner && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setShowBanner(false)}
        />
      )}

      {showBanner && (
        <motion.div
          key="consent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 max-w-md"
        >
          <div className="glass rounded-2xl shadow-2xl overflow-hidden">
            {!showDetails ? (
              // Simple banner
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-neutral-950 mb-1">
                      Cookies & Privacy
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      We use cookies to enhance your experience, personalize content, and analyze site traffic. Learn more about our cookie policy.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 mt-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg"
                      onClick={handleAcceptAll}
                    >
                      Accept All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg"
                      onClick={handleRejectAll}
                    >
                      Reject
                    </Button>
                  </div>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-1"
                  >
                    Customize preferences
                  </button>
                </div>
              </div>
            ) : (
              // Detailed preferences
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-950" />
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-950">
                    Privacy Preferences
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="ml-auto text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="space-y-3.5 mb-5">
                  {/* Essential Cookies */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mt-1 w-4 h-4 rounded border-neutral-300"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-neutral-950 block mb-0.5">
                        Essential Cookies
                      </label>
                      <p className="text-xs text-neutral-600">
                        Required for site functionality. Always enabled.
                      </p>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-neutral-950 block mb-0.5 cursor-pointer">
                        Analytics Cookies
                      </label>
                      <p className="text-xs text-neutral-600">
                        Help us understand how you use our site and improve your experience.
                      </p>
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-neutral-950 block mb-0.5 cursor-pointer">
                        Marketing Cookies
                      </label>
                      <p className="text-xs text-neutral-600">
                        Used to show you personalized ads and marketing content.
                      </p>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => togglePreference('preferences')}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-neutral-950 block mb-0.5 cursor-pointer">
                        Preference Cookies
                      </label>
                      <p className="text-xs text-neutral-600">
                        Remember your preferences and settings for future visits.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-4 border-t border-neutral-200">
                  <Button
                    size="sm"
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg"
                    onClick={handleSavePreferences}
                  >
                    Save Preferences
                  </Button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper functions for analytics/marketing initialization
function initializeAnalytics() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
}

function initializeMarketing() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }
}
