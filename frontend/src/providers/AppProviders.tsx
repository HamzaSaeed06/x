import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { CookieConsent } from '@/components/consent/CookieConsent';

function AuthInitializer() {
  useAuth();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInitializer />
      {children}
      <CookieConsent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#fff', secondary: '#16a34a' },
          },
          error: {
            iconTheme: { primary: '#fff', secondary: '#dc2626' },
            style: { background: '#dc2626' },
          },
        }}
      />
    </>
  );
}
