'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { auth } from '@/lib/firebase/client';
import { isSupabaseBackend } from '@/lib/services/backend';
import FadeIn from '@/components/motion/FadeIn';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // If already logged in, redirect directly to admin dashboard
  useEffect(() => {
    if (user) {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  // Lockout tick
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const isLocked = lockoutRemaining > 0;

  const mapAuthError = (codeOrMessage: string): string => {
    switch (codeOrMessage) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
      case 'invalid_credentials':
      case 'Invalid login credentials':
        // Generic response prevents username/email enumeration
        return 'Invalid email or password. Please verify your credentials and try again.';
      case 'auth/not-authorized':
      case 'not_authorized':
        return 'Not authorized: Your account does not have administrative privileges.';
      case 'auth/too-many-requests':
      case 'over_request_rate_limit':
        return 'Too many failed login attempts. Access is temporarily locked. Please wait a few minutes before trying again.';
      case 'auth/user-disabled':
        return 'This administrative account has been deactivated.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please verify your internet connectivity.';
      default:
        return 'Authentication failed. Please verify your credentials and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    if (isSupabaseBackend()) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase authentication service is not properly configured.');
        return;
      }
    } else {
      if (!auth.app.options.apiKey) {
        setError('Authentication service is not properly configured.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim();
      await login(cleanEmail, password);
      // Reset counter on successful authentication
      setFailedAttempts(0);
      setLockoutRemaining(0);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= MAX_FAILED_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_SECONDS);
        setError(`Too many consecutive failed attempts. Sign-in is locked for ${LOCKOUT_SECONDS} seconds.`);
      } else if (err && typeof err === 'object' && 'code' in err) {
        const errorWithCode = err as { code: string };
        setError(mapAuthError(errorWithCode.code));
      } else if (err instanceof Error) {
        setError(mapAuthError(err.message));
      } else {
        setError('Authentication failed. Please verify your credentials and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0C0C0C] text-[#EDEDED]">
      <FadeIn y={20} className="max-w-md w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8E9BAE] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Portfolio</span>
        </Link>

        {/* Login Box */}
        <div className="p-8 bg-[#141414] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#BBCCD7]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">
              Admin Portal
            </h1>
            <p className="text-xs text-[#8E9BAE] mt-1 font-light">
              Sign in with your administrator credentials
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 border border-red-500/20 bg-red-500/10 text-red-300 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-[#8E9BAE] mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={loading || isLocked}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#0e0e0e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-[#8E9BAE] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading || isLocked}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#0e0e0e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isLocked}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-2.5 px-4 rounded-full bg-[#BBCCD7] text-[#0C0C0C] text-xs font-semibold hover:bg-white shadow-[0_0_20px_rgba(187,204,215,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : isLocked ? (
                <span>Locked ({lockoutRemaining}s)</span>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <span className="text-[11px] text-[#8E9BAE]/60 font-light">
              Secured with Firebase Authentication & Role Enforcement
            </span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
