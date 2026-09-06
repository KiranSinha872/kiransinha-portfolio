'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';

const NAV_LINKS = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Education', href: '#education' },
  { name: 'Certifications', href: '#certifications' },
  { name: 'Profiles', href: '#coding-profiles' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0C0C0C]/80 backdrop-blur-md border-b border-white/10">
      <FadeIn delay={0.05} duration={0.6} y={-10}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="font-bold text-xl tracking-tight gradient-text-light hover:opacity-90 transition-opacity"
          >
            Kiran Sinha
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full text-sm font-light text-[#8E9BAE] hover:text-white hover:bg-white/5 transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#contact"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-black bg-[#BBCCD7] hover:bg-white shadow-[0_0_15px_rgba(187,204,215,0.25)] transition-all"
            >
              <span>Contact</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </FadeIn>

      {/* Mobile Menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#121212] px-6 py-4 space-y-2.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-[#8E9BAE] hover:text-white text-sm py-1.5 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
