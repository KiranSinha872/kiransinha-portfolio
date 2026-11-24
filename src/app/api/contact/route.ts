import { NextResponse, type NextRequest } from 'next/server';
import { contactMessageSchema } from '@/lib/security/validation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseBackend } from '@/lib/services/backend';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// In-memory rate limiting map: IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // 5 messages per 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Public Contact Submission Route Handler:
 * 1. IP-based rate limiting (5 requests / 10 minutes).
 * 2. Cloudflare Turnstile CAPTCHA server-side verification.
 * 3. Zod schema validation & sanitization.
 * 4. Anonymous server client insertion into contact_messages.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. IP extraction and rate limiting
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, message, turnstileToken } = body;

    // 2. Cloudflare Turnstile Verification
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Security verification is required. Please complete the captcha.' },
          { status: 400 }
        );
      }

      const verifyFormData = new URLSearchParams();
      verifyFormData.append('secret', turnstileSecret);
      verifyFormData.append('response', turnstileToken);
      if (ip !== '127.0.0.1') {
        verifyFormData.append('remoteip', ip);
      }

      try {
        const verifyRes = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            body: verifyFormData,
          }
        );

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          console.warn('Turnstile verification rejection:', verifyData);
          return NextResponse.json(
            { error: 'Security verification failed. Please try again.' },
            { status: 400 }
          );
        }
      } catch (verifyErr) {
        console.error('Turnstile verification service error:', verifyErr);
        return NextResponse.json(
          { error: 'Verification service error. Please try again later.' },
          { status: 502 }
        );
      }
    }

    // 3. Zod Schema Validation
    const validationResult = contactMessageSchema.safeParse({ name, email, message });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed. Please review your input.',
          issues: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validated = validationResult.data;

    // 4. Server-side database insertion (no direct browser insertion)
    if (isSupabaseBackend()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name: validated.name,
          email: validated.email,
          message: validated.message,
          read: false,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase contact insertion error:', error);
        return NextResponse.json(
          { error: 'Failed to record message in database.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, id: data.id });
    }

    // Firebase fallback insertion
    const contactRef = collection(db, 'contact_messages');
    const docRef = await addDoc(contactRef, {
      ...validated,
      read: false,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Contact handler uncaught error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
