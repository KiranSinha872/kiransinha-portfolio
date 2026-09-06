'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error tracking service in production (e.g. Sentry)
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center px-6 text-center">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-b from-red-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        {/* Error icon / code */}
        <p className="font-mono text-8xl font-extrabold text-red-400/60 select-none">500</p>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Something went wrong
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-[#8E9BAE] font-light leading-relaxed">
          An unexpected error occurred. You can try again or go back to the home page.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#BBCCD7] text-[#0C0C0C] text-sm font-semibold tracking-wide hover:bg-white shadow-[0_0_20px_rgba(187,204,215,0.25)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-all"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
