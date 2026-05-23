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
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-950 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-neutral-800/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex flex-col items-start leading-none group">
            <span className="text-3xl font-bold tracking-[0.2em]">ZEST</span>
            <span className="text-xs font-medium text-neutral-400 tracking-[0.3em] mt-1">
              & PARTNERS
            </span>
          </Link>
          
          {/* Content */}
          <div className="space-y-8 max-w-md">
            <div className="w-20 h-20 bg-white/10 flex items-center justify-center">
              <KeyRound className="w-10 h-10" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Forgot your password?</h2>
              <p className="mt-4 text-neutral-400 text-lg leading-relaxed">
                No worries! It happens to the best of us. Enter your email and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10">
              <Shield className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Your security matters</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Reset links expire after 1 hour and can only be used once.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-sm text-neutral-500">
            Need help? Contact support@zestandpartners.com
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-10 lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center leading-none group">
              <span className="text-2xl font-bold text-black tracking-[0.2em]">ZEST</span>
              <span className="text-[10px] font-medium text-neutral-500 tracking-[0.3em] mt-0.5">
                & PARTNERS
              </span>
            </Link>
          </div>
          
          {/* Back link */}
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 mx-auto flex items-center justify-center rounded-full">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Check your email</h1>
                <p className="mt-3 text-neutral-500 leading-relaxed">
                  If an account exists for <span className="font-semibold text-neutral-900">{email}</span>, 
                  we&apos;ve sent a password reset link.
                </p>
              </div>
              
              <div className="p-4 bg-neutral-50 border border-neutral-100 text-left">
                <p className="text-sm text-neutral-600">
                  <strong className="text-neutral-900">Didn&apos;t receive the email?</strong>
                  <br />
                  Check your spam folder, or{' '}
                  <button 
                    onClick={() => setSent(false)} 
                    className="text-neutral-900 font-semibold hover:underline"
                  >
                    try again
                  </button>
                  {' '}with a different email.
                </p>
              </div>
              
              <Link href="/auth/login">
                <Button className="w-full h-12" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Reset your password</h1>
                <p className="mt-2 text-neutral-500">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
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
                
                <Button type="submit" isLoading={loading} className="w-full h-12" size="lg">
                  Send Reset Link <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-neutral-500">
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
