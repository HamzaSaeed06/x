import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { useRouter, useSearchParams } from '@/hooks/useNextRouter';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShoppingBag, Sparkles, Shield, Truck } from 'lucide-react';
import { signIn, signInWithGoogle, getErrorMessage } from '@/lib/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { GoogleButton } from '@/components/auth/GoogleButton';

const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const features = [
  { icon: ShoppingBag, title: 'Exclusive Collections', desc: 'Access members-only drops and early releases' },
  { icon: Sparkles, title: 'Loyalty Rewards', desc: 'Earn points on every purchase you make' },
  { icon: Shield, title: 'Secure Checkout', desc: 'Your data is protected with enterprise security' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Free express shipping on orders over Rs. 5,000' },
];

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { setUser, setRole } = useAuthStore();

  const afterLogin = (user: any) => {
    const role = user.role || 'user';
    document.cookie = `auth-token=${user.uid}; path=/; max-age=604800`;
    document.cookie = `auth-role=${role}; path=/; max-age=604800`;
    setUser(user);
    setRole(role);
    let target = redirect;
    if (target === '/' && role === 'admin') target = '/admin';
    window.location.href = target;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading('Authenticating...');
    try {
      const user = await signIn(email, password);
      toast.success('Login successful!', { id });
      afterLogin(user);
    } catch (err: any) {
      toast.error(getErrorMessage(err), { id });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (access_token: string) => {
    setGoogleLoading(true);
    const id = toast.loading('Signing in with Google...');
    try {
      const user = await signInWithGoogle(access_token);
      toast.success('Welcome!', { id });
      afterLogin(user);
    } catch (err: any) {
      toast.error(getErrorMessage(err), { id });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="lg:h-screen lg:overflow-hidden min-h-screen flex">
      {/* Left side - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] lg:h-full lg:overflow-hidden relative border-r-2 border-neutral-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")' }}
        />
        {/* Sleek Dark Charcoal Overlay */}
        <div 
          className="absolute inset-0 bg-neutral-950/90"
        />
        
        <div className="relative z-10 flex flex-col justify-between p-6 lg:p-8 xl:p-12 w-full text-white">
          {/* Logo */}
          <Link href="/" className="inline-flex flex-col items-start leading-none group">
            <span className="text-3xl xl:text-4xl font-bold tracking-[0.2em] font-serif">ZEST</span>
            <span className="text-xs font-medium text-white/70 tracking-[0.3em] mt-1">
              & PARTNERS
            </span>
          </Link>
          
          {/* Features - Solid 3D Container */}
          <div 
            className="space-y-4 lg:space-y-5 max-w-md p-6 lg:p-8 border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] bg-neutral-900/90"
          >
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight font-serif">
                Welcome back
              </h2>
              <p className="mt-1 text-white/70 text-xs lg:text-sm leading-relaxed">
                Sign in to access your account, track orders, and enjoy exclusive member benefits.
              </p>
            </div>
            
            <div className="space-y-3.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 bg-neutral-950 border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-800 transition-colors">
                    <feature.icon className="w-4 h-4 text-white/80" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs lg:text-sm">{feature.title}</h3>
                    <p className="text-[11px] lg:text-xs text-white/60 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-xs text-white/40">
            Premium fashion & lifestyle since 2020
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 lg:h-full lg:overflow-hidden bg-neutral-50">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Accent line - Luxury Gold */}
          <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-5 sm:mb-6" />
          
          {/* Mobile logo */}
          <div className="text-center mb-5 lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center leading-none group">
              <span className="text-xl font-bold text-black tracking-[0.2em] font-serif">ZEST</span>
              <span className="text-[9px] font-medium text-neutral-500 tracking-[0.3em] mt-0.5">
                & PARTNERS
              </span>
            </Link>
          </div>
          
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-serif">Sign in</h1>
            <p className="mt-1 text-xs text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-neutral-900 hover:underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              id="email"
              type="email"
              label="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="w-4 h-4" />}
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                icon={<Lock className="w-4 h-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 border-neutral-900 rounded-none text-neutral-950 focus:ring-neutral-950 focus:ring-offset-0" 
                />
                <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-neutral-900 hover:underline underline-offset-4">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              disabled={loading || googleLoading}
              className="w-full h-11"
              size="default"
              variant="default"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          {hasGoogle ? (
            <GoogleButton
              label="Continue with Google"
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed. Please try again.')}
              disabled={loading}
              loading={googleLoading}
            />
          ) : (
            <button
              type="button"
              onClick={() => toast('Google Sign-In requires Client ID.', { icon: 'ℹ' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-neutral-900 bg-white hover:bg-neutral-50 transition-all text-xs font-bold text-neutral-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
