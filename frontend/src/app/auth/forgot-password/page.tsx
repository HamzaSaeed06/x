import { useState } from 'react';
import { Link } from 'wouter';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, KeyRound, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword, getErrorMessage } from '@/lib/services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:h-screen lg:overflow-hidden min-h-screen flex">
      {/* Left side - Brand & Deco */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] lg:h-full lg:overflow-hidden relative border-r-2 border-neutral-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")' }}
        />
        {/* Premium Slate Blue Tinted Overlay */}
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
          
          {/* Content - Solid 3D Container */}
          <div 
            className="space-y-4 lg:space-y-5 max-w-md p-6 lg:p-8 border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] bg-neutral-900/90"
          >
            <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white/80" />
            </div>
            
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight font-serif">
                Forgot your password?
              </h2>
              <p className="mt-1.5 text-white/70 text-xs lg:text-sm leading-relaxed">
                No worries! It happens to the best of us. Enter your email and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-neutral-950 border border-neutral-800">
              <Shield className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-xs lg:text-sm">Your security matters</h3>
                <p className="text-[11px] lg:text-xs text-white/60 mt-0.5">
                  Reset links expire after 1 hour and can only be used once.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-xs text-white/40">
            Need help? Contact support@zestandpartners.com
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 lg:h-full lg:overflow-hidden bg-neutral-50">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Slate Blue accent line */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-300 to-blue-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-5 sm:mb-6" />

          {/* Mobile logo */}
          <div className="text-center mb-5 lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center leading-none group">
              <span className="text-xl font-bold text-black tracking-[0.2em] font-serif">ZEST</span>
              <span className="text-[9px] font-medium text-neutral-500 tracking-[0.3em] mt-0.5">
                & PARTNERS
              </span>
            </Link>
          </div>
          
          {/* Back link */}
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:underline transition-colors mb-4 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-neutral-50 mx-auto flex items-center justify-center border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle className="w-6 h-6 text-neutral-900" />
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-neutral-900 font-serif">Check your email</h1>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                  If an account exists for <span className="font-semibold text-neutral-900">{email}</span>, 
                  we&apos;ve sent a password reset link.
                </p>
              </div>
              
              <div className="p-3 bg-neutral-50 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left">
                <p className="text-xs text-neutral-600">
                  <strong className="text-neutral-900">Didn&apos;t receive the email?</strong>
                  <br />
                  Check your spam folder, or{' '}
                  <button 
                    onClick={() => setSent(false)} 
                    className="text-neutral-900 font-bold hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
              
              <Link href="/auth/login">
                <Button className="w-full h-11" size="default" variant="default">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-serif">Reset password</h1>
                <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
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
                
                <Button type="submit" isLoading={loading} className="w-full h-11" size="default" variant="default">
                  Send Reset Link <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-neutral-500">
                Remember your password?{' '}
                <Link href="/auth/login" className="font-semibold text-neutral-900 hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
