import { useState } from 'react';
import { Link } from 'wouter';
import { useRouter } from '@/hooks/useNextRouter';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Gift, Heart, Zap } from 'lucide-react';
import { signUp, signInWithGoogle, getErrorMessage } from '@/lib/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleButton } from '@/components/auth/GoogleButton';

const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const benefits = [
  { icon: Gift, text: '500 bonus points on signup' },
  { icon: Heart, text: 'Save favorites & wishlists' },
  { icon: Zap, text: 'Faster checkout experience' },
  { icon: CheckCircle, text: 'Exclusive member discounts' },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { setUser, setRole } = useAuthStore();

  const afterAuth = (user: any) => {
    setUser(user);
    setRole(user.role ?? 'user');
    document.cookie = `auth-token=${user.uid}; path=/; max-age=604800`;
    if (user.role) {
      document.cookie = `auth-role=${user.role}; path=/; max-age=604800`;
    }
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the terms and privacy policy');
      return;
    }
    setLoading(true);
    try {
      const user = await signUp(email, password, name);
      toast.success('Account created! Welcome to Zest & Partners');
      afterAuth(user);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (access_token: string) => {
    setGoogleLoading(true);
    const id = toast.loading('Signing up with Google...');
    try {
      const user = await signInWithGoogle(access_token);
      toast.success('Welcome to Zest & Partners', { id });
      afterAuth(user);
    } catch (err: any) {
      toast.error(getErrorMessage(err), { id });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-neutral-950 text-white relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-60 lg:w-80 h-60 lg:h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 lg:w-96 h-72 lg:h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-10 xl:p-12 w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex flex-col items-start leading-none group">
            <span className="text-2xl lg:text-3xl font-bold tracking-[0.2em]">ZEST</span>
            <span className="text-[10px] lg:text-xs font-medium text-neutral-400 tracking-[0.3em] mt-1">
              & PARTNERS
            </span>
          </Link>
          
          {/* Content */}
          <div className="space-y-8 lg:space-y-10 max-w-md">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                Join the<br />
                <span className="text-neutral-400">ZEST family</span>
              </h2>
              <p className="mt-3 lg:mt-4 text-neutral-400 text-base lg:text-lg leading-relaxed">
                Create an account to unlock exclusive benefits, track your orders, and enjoy a personalized shopping experience.
              </p>
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 lg:gap-4 group">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-sm lg:text-base text-neutral-300">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-8 lg:gap-12">
            <div>
              <div className="text-2xl lg:text-3xl font-bold">50K+</div>
              <div className="text-xs lg:text-sm text-neutral-500">Happy customers</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold">4.9</div>
              <div className="text-xs lg:text-sm text-neutral-500">Average rating</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold">24/7</div>
              <div className="text-xs lg:text-sm text-neutral-500">Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 xs:p-6 sm:p-8 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 sm:mb-10 lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center leading-none group">
              <span className="text-xl xs:text-2xl font-bold text-black tracking-[0.2em]">ZEST</span>
              <span className="text-[9px] xs:text-[10px] font-medium text-neutral-500 tracking-[0.3em] mt-0.5">
                & PARTNERS
              </span>
            </Link>
          </div>
          
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Create your account</h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-neutral-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-neutral-900 hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Input 
              id="name" 
              label="Full Name" 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe" 
              autoComplete="name" 
              icon={<User className="w-4 h-4" />} 
            />

            <Input 
              id="email" 
              label="Email address" 
              type="email" 
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
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                icon={<Lock className="w-4 h-4" />}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            <div className="flex gap-1 sm:gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= i * 3 
                      ? password.length >= 12 
                        ? 'bg-green-500' 
                        : password.length >= 8 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      : 'bg-neutral-200'
                  }`} 
                />
              ))}
            </div>

            <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 border-neutral-300 rounded text-neutral-900 focus:ring-neutral-900 flex-shrink-0" 
              />
              <span className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-neutral-900 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-semibold text-neutral-900 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button 
              type="submit" 
              disabled={loading || googleLoading} 
              isLoading={loading} 
              className="w-full h-11 sm:h-12"
              size="lg"
            >
              Create Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 sm:px-4 text-xs sm:text-sm text-neutral-400">or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
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
              onClick={() => toast('Google Sign-In requires VITE_GOOGLE_CLIENT_ID to be set in Secrets.', { icon: 'i' })}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-xs sm:text-sm font-medium text-neutral-900 rounded-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
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
