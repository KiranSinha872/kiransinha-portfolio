import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 – Page Not Found | Kiran Sinha',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center px-6 text-center">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#BBCCD7]/8 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        {/* Error code */}
        <p className="font-mono text-8xl font-extrabold gradient-text select-none">404</p>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Page not found
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-[#8E9BAE] font-light leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-[#BBCCD7] text-[#0C0C0C] text-sm font-semibold tracking-wide hover:bg-white shadow-[0_0_20px_rgba(187,204,215,0.25)] transition-all transform hover:-translate-y-0.5"
        >
          ← Return Home
        </Link>
      </div>
    </div>
  );
}
