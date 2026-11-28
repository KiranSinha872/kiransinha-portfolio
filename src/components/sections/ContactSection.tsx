'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '@/components/ui/PlatformIcons';
import Container from '@/components/ui/Container';
import { submitContactMessage } from '@/lib/services/contact';
import { contactMessageSchema } from '@/lib/security/validation';
import type { Profile } from '@/types';

interface ContactSectionProps {
  profile?: Profile | null;
}

const STEP_1_OPTIONS = [
  { id: 'fulltime', label: 'Full-Time Engineering', desc: 'Software engineer, full-stack, or backend role' },
  { id: 'internship', label: 'Internship / Co-op', desc: 'Summer or term developer internship' },
  { id: 'contract', label: 'Project / Contract', desc: 'Web product development, MVP, or architecture' },
  { id: 'collab', label: 'Open-Source & Research', desc: 'Technical collaboration or academic exploration' },
];

const STEP_2_OPTIONS = [
  { id: 'immediate', label: 'Immediately', desc: 'Ready to start right away' },
  { id: '1-3months', label: 'Within 1–3 Months', desc: 'Upcoming project phase or next term' },
  { id: 'flexible', label: 'Flexible / Planning', desc: 'Exploring potential fit for the future' },
];

const STEP_3_OPTIONS = [
  { id: 'fullstack', label: 'Full-Stack / Next.js & React', desc: 'End-to-end web architecture & design' },
  { id: 'aiml', label: 'AI & Applied Machine Learning', desc: 'Model integration & data pipelines' },
  { id: 'backend', label: 'Backend, Databases & APIs', desc: 'PostgreSQL, Supabase & server actions' },
  { id: 'algorithms', label: 'Algorithms & Systems Logic', desc: 'Performance-critical problem solving' },
];

const STEP_4_OPTIONS = [
  { id: 'startup', label: 'Fast-Paced Startup', desc: 'High-velocity 0-to-1 product engineering' },
  { id: 'enterprise', label: 'Established Tech Enterprise', desc: 'Large scale, reliability & structured teams' },
  { id: 'research', label: 'Academic / Research Lab', desc: 'University projects & scientific exploration' },
  { id: 'independent', label: 'Direct Builder / Founder', desc: 'Independent founders or individual vision' },
];

export default function ContactSection({ profile }: ContactSectionProps) {
  const email = profile?.contactEmail || profile?.email || 'sinhakiran872@gmail.com';
  const linkedinUrl =
    profile?.linkedinUrl || 'https://www.linkedin.com/in/kiran-sinha-555510377/?skipRedirect=true';
  const githubUrl = profile?.githubUrl || 'https://github.com/KiranSinha872';

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // 5-Step Questionnaire State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scope, setScope] = useState<string>(STEP_1_OPTIONS[0].label);
  const [timeline, setTimeline] = useState<string>(STEP_2_OPTIONS[0].label);
  const [techFocus, setTechFocus] = useState<string>(STEP_3_OPTIONS[0].label);
  const [orgType, setOrgType] = useState<string>(STEP_4_OPTIONS[0].label);

  // Final Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    note: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Copy email helper
  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Render Cloudflare Turnstile if siteKey is provided
  useEffect(() => {
    if (!siteKey || currentStep !== 5) return;

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
            theme: 'auto',
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
      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );
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
  }, [siteKey, currentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    // Synthesize structured inquiry message
    const formattedMessage = [
      `[OPPORTUNITY INQUIRY]`,
      `• Scope: ${scope}`,
      `• Timeline: ${timeline}`,
      `• Technology Focus: ${techFocus}`,
      `• Organization: ${orgType}`,
      formData.note.trim() ? `\n[NOTE]\n${formData.note.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const result = contactMessageSchema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formattedMessage,
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
      setFormData({ name: '', email: '', note: '' });
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

  const resetForm = () => {
    setCurrentStep(1);
    setStatus('idle');
    setFormData({ name: '', email: '', note: '' });
  };

  return (
    <section
      id="contact"
      className="scroll-mt-28 py-20 sm:py-28 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="pb-10 border-b border-[var(--line)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0B7658] font-bold">
              [ 05 / GET IN TOUCH ]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B7658] animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
            Let&apos;s Build Together
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-xl">
            Have an engineering role, project, or technical question? Step through the quick guided questionnaire below or reach out directly.
          </p>
        </div>

        {/* 2-Column Split: Direct Channels vs 5-Step Questionnaire */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Channels & Profiles */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  DIRECT EMAIL
                </span>
                <div className="mt-2 flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--line)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-[#0B7658] shrink-0" />
                    <span className="text-sm font-semibold truncate text-[var(--foreground)]">
                      {email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg hover:bg-[var(--line)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-[#0B7658]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  LOCATION & AVAILABILITY
                </span>
                <p className="mt-2 text-sm text-[var(--foreground)] font-medium">
                  Delhi & Assam, India • Open for On-Site & Remote Roles
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--line)] space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] block">
                  PROFESSIONAL NETWORKS
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--line)] hover:border-[#0B7658] text-xs font-mono font-medium text-[var(--foreground)] transition-all"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5 text-[#0B7658]" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  </a>

                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--line)] hover:border-[#0B7658] text-xs font-mono font-medium text-[var(--foreground)] transition-all"
                  >
                    <GitHubIcon className="w-3.5 h-3.5 text-[#0B7658]" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 5-Step Guided Questionnaire */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs relative">
              {/* Questionnaire Step Progress Indicator */}
              {status !== 'success' && (
                <div className="pb-6 mb-6 border-b border-[var(--line)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B7658] uppercase tracking-wider">
                      STEP 0{currentStep} / 05
                    </span>
                    <span className="text-xs text-[var(--muted)] font-mono">
                      {currentStep === 1 && '• Opportunity'}
                      {currentStep === 2 && '• Timeline'}
                      {currentStep === 3 && '• Focus Area'}
                      {currentStep === 4 && '• Organization'}
                      {currentStep === 5 && '• Your Details'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-28 h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                    <div
                      className="h-full bg-[#0B7658] transition-all duration-300 ease-out"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Confirmation Screen */}
              {status === 'success' ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#0B7658]/10 text-[#0B7658] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                    Inquiry Received!
                  </h3>
                  <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your inquiry has been stored securely in my database, and I will get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Step 1: Opportunity Scope */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        What kind of opportunity are we discussing?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {STEP_1_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setScope(opt.label)}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                              scope === opt.label
                                ? 'border-[#0B7658] bg-[#0B7658]/5 ring-1 ring-[#0B7658]'
                                : 'border-[var(--line)] bg-[var(--background)] hover:border-[var(--line-h)]'
                            }`}
                          >
                            <p className="text-sm font-bold text-[var(--foreground)]">{opt.label}</p>
                            <p className="text-xs text-[var(--muted)] mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Timeline */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        When would you like to start?
                      </h3>
                      <div className="grid grid-cols-1 gap-3 pt-2">
                        {STEP_2_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTimeline(opt.label)}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                              timeline === opt.label
                                ? 'border-[#0B7658] bg-[#0B7658]/5 ring-1 ring-[#0B7658]'
                                : 'border-[var(--line)] bg-[var(--background)] hover:border-[var(--line-h)]'
                            }`}
                          >
                            <p className="text-sm font-bold text-[var(--foreground)]">{opt.label}</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Technology Focus */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        Which technical area is central to this work?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {STEP_3_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTechFocus(opt.label)}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                              techFocus === opt.label
                                ? 'border-[#0B7658] bg-[#0B7658]/5 ring-1 ring-[#0B7658]'
                                : 'border-[var(--line)] bg-[var(--background)] hover:border-[var(--line-h)]'
                            }`}
                          >
                            <p className="text-sm font-bold text-[var(--foreground)]">{opt.label}</p>
                            <p className="text-xs text-[var(--muted)] mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Organization Type */}
                  {currentStep === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        What type of team or organization is this?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {STEP_4_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setOrgType(opt.label)}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                              orgType === opt.label
                                ? 'border-[#0B7658] bg-[#0B7658]/5 ring-1 ring-[#0B7658]'
                                : 'border-[var(--line)] bg-[var(--background)] hover:border-[var(--line-h)]'
                            }`}
                          >
                            <p className="text-sm font-bold text-[var(--foreground)]">{opt.label}</p>
                            <p className="text-xs text-[var(--muted)] mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Final Contact Information */}
                  {currentStep === 5 && (
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        Where should I send my reply?
                      </h3>

                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-xs font-mono uppercase text-[var(--muted)] mb-1">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Alex Smith"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[#0B7658]"
                          />
                          {fieldErrors.name && (
                            <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-[var(--muted)] mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="alex@example.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[#0B7658]"
                          />
                          {fieldErrors.email && (
                            <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-[var(--muted)] mb-1">
                            Additional Details (Optional)
                          </label>
                          <textarea
                            rows={3}
                            value={formData.note}
                            onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                            placeholder="Tell me a bit about your product, project scope, or role specifications..."
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[#0B7658] resize-none"
                          />
                        </div>

                        {/* Cloudflare Turnstile CAPTCHA container */}
                        {siteKey && (
                          <div className="pt-2">
                            <div ref={turnstileContainerRef} className="min-h-[65px]" />
                          </div>
                        )}

                        {errorMessage && (
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMessage}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="mt-8 pt-5 border-t border-[var(--line)] flex items-center justify-between gap-4">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--line)] hover:border-[var(--line-h)] text-xs font-mono font-medium text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B7658] text-white text-xs font-bold tracking-wide hover:bg-[#09634a] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Inquiry</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
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
