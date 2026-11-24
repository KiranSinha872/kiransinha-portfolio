'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, ArrowUpRight, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { LinkedInIcon } from '@/components/ui/PlatformIcons';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { submitContactMessage } from '@/lib/services/contact';
import { contactMessageSchema } from '@/lib/security/validation';
import type { Profile } from '@/types';

interface ContactSectionProps {
  profile?: Profile | null;
}

export default function ContactSection({ profile }: ContactSectionProps) {
  const email = profile?.contactEmail || profile?.email || '';
  const phone = profile?.phone || '';
  const linkedinUrl =
    profile?.linkedinUrl ||
    profile?.socials?.find((s) => s.platform.toLowerCase().includes('link'))?.url ||
    '';

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Render Cloudflare Turnstile if siteKey is provided
  useEffect(() => {
    if (!siteKey) return;

    let widgetId: string | null = null;
    let isMounted = true;
    let scriptLoadedListener: (() => void) | null = null;
    let attachedScript: Element | null = null;

    const renderWidget = () => {
      if (
        isMounted &&
        turnstileContainerRef.current &&
        typeof window !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).turnstile
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const turnstile = (window as any).turnstile;
        turnstileContainerRef.current.innerHTML = '';
        try {
          widgetId = turnstile.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            theme: 'light',
            callback: (token: string) => {
              if (isMounted) setTurnstileToken(token);
            },
            'expired-callback': () => {
              if (isMounted) setTurnstileToken('');
            },
            'error-callback': () => {
              if (isMounted) setTurnstileToken('');
            },
          });
        } catch (err) {
          console.warn('Turnstile render warning:', err);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => renderWidget();
        document.head.appendChild(script);
      } else {
        scriptLoadedListener = renderWidget;
        attachedScript = existingScript;
        existingScript.addEventListener('load', scriptLoadedListener);
      }
    }

    return () => {
      isMounted = false;
      if (attachedScript && scriptLoadedListener) {
        attachedScript.removeEventListener('load', scriptLoadedListener);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (widgetId && typeof window !== 'undefined' && (window as any).turnstile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).turnstile.remove(widgetId);
      }
    };
  }, [siteKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    // Client-side Zod validation matching Firestore security rules
    const result = contactMessageSchema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      await submitContactMessage(result.data, turnstileToken);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTurnstileToken('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to send message. Please try again or reach out directly via email.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#F1F1F1] border-b border-[#DADADA]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: "Let's Connect" details and bordered CTA box */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              <SectionHeading
                label="LET'S CONNECT"
                title="Start a Conversation"
                description="I am currently available for software engineering roles, technical collaboration, and freelance opportunities."
              />

              {/* Direct Contact Details */}
              <div className="mt-8 space-y-4">
                {email && (
                  <div className="flex items-center gap-3 text-sm text-[#121212]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#DADADA] flex items-center justify-center text-[#0B7658] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B5B5B] block">
                        Email
                      </span>
                      <a
                        href={`mailto:${email}`}
                        className="font-medium text-[#121212] hover:text-[#0B7658] transition-colors truncate block"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {linkedinUrl && (
                  <div className="flex items-center gap-3 text-sm text-[#121212]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#DADADA] flex items-center justify-center text-[#0B7658] shrink-0">
                      <LinkedInIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B5B5B] block">
                        LinkedIn
                      </span>
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#121212] hover:text-[#0B7658] transition-colors truncate block"
                      >
                        {linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex items-center gap-3 text-sm text-[#121212]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#DADADA] flex items-center justify-center text-[#0B7658] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B5B5B] block">
                        Phone
                      </span>
                      <a
                        href={`tel:${phone}`}
                        className="font-medium text-[#121212] hover:text-[#0B7658] transition-colors block"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bordered CTA Box matching reference */}
            <a
              href="#contact-form"
              className="group block p-6 rounded-xl border-2 border-[#0B7658] bg-white hover:bg-[#0B7658] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
            >
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0B7658] group-hover:text-white transition-colors block mb-1">
                    Let&apos;s Build
                  </span>
                  <p className="font-heading text-2xl uppercase tracking-tight text-[#121212] group-hover:text-white transition-colors leading-tight">
                    Something Great Together
                  </p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-[#0B7658] group-hover:text-white transition-colors shrink-0 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          </div>

          {/* Right Column: Contact Message Form */}
          <div id="contact-form" className="lg:col-span-7">
            <div className="bg-white border border-[#DADADA] rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#121212] tracking-tight mb-2">
                Send a Message
              </h3>
              <p className="text-xs sm:text-sm text-[#5B5B5B] mb-6">
                Fill out the form below to reach me directly.
              </p>

              {status === 'success' ? (
                <div className="p-6 rounded-xl bg-[#F9F9F9] border border-[#0B7658]/30 flex flex-col items-center text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#0B7658]" />
                  <h4 className="text-base font-bold text-[#121212]">
                    Message Sent Successfully
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5B5B5B] max-w-sm">
                    Thank you for reaching out. Your message has been recorded and I will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-3 px-5 py-2 rounded-full border border-[#DADADA] bg-white text-xs font-semibold text-[#121212] hover:border-[#0B7658] hover:text-[#0B7658] transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {status === 'error' && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#121212] mb-1.5"
                    >
                      Your Name <span className="text-[#0B7658]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Johnson"
                      className={`w-full px-4 py-2.5 rounded-lg bg-[#F9F9F9] border ${
                        fieldErrors.name ? 'border-red-500' : 'border-[#DADADA]'
                      } text-sm text-[#121212] placeholder:text-[#5B5B5B] focus:outline-none focus:border-[#0B7658] focus:ring-1 focus:ring-[#0B7658] transition-colors`}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#121212] mb-1.5"
                    >
                      Email Address <span className="text-[#0B7658]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@domain.com"
                      className={`w-full px-4 py-2.5 rounded-lg bg-[#F9F9F9] border ${
                        fieldErrors.email ? 'border-red-500' : 'border-[#DADADA]'
                      } text-sm text-[#121212] placeholder:text-[#5B5B5B] focus:outline-none focus:border-[#0B7658] focus:ring-1 focus:ring-[#0B7658] transition-colors`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#121212] mb-1.5"
                    >
                      Message <span className="text-[#0B7658]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="What would you like to discuss?"
                      className={`w-full px-4 py-2.5 rounded-lg bg-[#F9F9F9] border ${
                        fieldErrors.message ? 'border-red-500' : 'border-[#DADADA]'
                      } text-sm text-[#121212] placeholder:text-[#5B5B5B] focus:outline-none focus:border-[#0B7658] focus:ring-1 focus:ring-[#0B7658] transition-colors resize-y`}
                    />
                    {fieldErrors.message && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>
                    )}
                  </div>

                  {siteKey && (
                    <div className="pt-2">
                      <div ref={turnstileContainerRef} className="min-h-[65px]" />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0B7658] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#096148] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
