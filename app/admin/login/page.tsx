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
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import FadeIn from '@/components/motion/FadeIn';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // If already logged in, redirect directly to admin dashboard
  useEffect(() => {
    if (user) {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  const mapAuthError = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No user found with this email. Please check the email entered in Firebase Console > Authentication > Users.';
      case 'auth/wrong-password':
        return 'Incorrect password. Note that passwords are case-sensitive.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please verify your email and password match your Firebase user account exactly (case-sensitive).';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Access temporarily blocked due to multiple failed login attempts. Please wait a few minutes and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled in Firebase Console.';
      case 'auth/network-request-failed':
        return 'Network request failed. Please check your internet connection.';
      case 'auth/api-key-not-valid':
      case 'auth/invalid-api-key':
        return 'Invalid Firebase API Key. Please verify NEXT_PUBLIC_FIREBASE_API_KEY in .env.local and restart dev server.';
      case 'auth/configuration-not-found':
      case 'auth/project-not-found':
        return 'Firebase project configuration not found. Please verify your .env.local credentials.';
      default:
        return 'Authentication failed. Please check your credentials and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    // Check if Firebase configuration is initialized
    if (!auth.app.options.apiKey) {
      setError(
        'Firebase API Key is missing. Please check your .env.local file and restart the Next.js dev server.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setErrorCode('');

    try {
      const cleanEmail = email.trim();
      await login(cleanEmail, password);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      console.error('Firebase Auth sign in error:', err);
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string };
        setErrorCode(firebaseError.code);
        setError(mapAuthError(firebaseError.code));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during sign in.');
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
              Sign in with your Firebase credentials to manage your portfolio
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 border border-red-500/20 bg-red-500/10 text-red-300 text-xs rounded-xl space-y-1">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
              {errorCode && (
                <div className="text-[10px] font-mono text-red-400/80 pl-6">
                  Code: {errorCode}
                </div>
              )}
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
                  disabled={loading}
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
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#0e0e0e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
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
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full bg-[#BBCCD7] text-[#0C0C0C] text-xs font-semibold hover:bg-white shadow-[0_0_20px_rgba(187,204,215,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <span className="text-[11px] text-[#8E9BAE]/60 font-light">
              Secured with Firebase Authentication
            </span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
