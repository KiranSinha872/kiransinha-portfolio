# Security Guide & Hardening Reference

This document outlines the security architecture, PostgreSQL Row Level Security (RLS) model, Supabase Auth admin verification, Cloudflare Turnstile bot protection, and credentials checklist.

---

## 1. Supabase Architecture & Row Level Security (RLS)

All client-facing requests to PostgreSQL tables communicate through Supabase using the public anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). Access control is enforced in PostgreSQL via Row Level Security (RLS) policies.

### Public Read Access
The following tables are readable by anyone (anon and authenticated):
- `public.profile`
- `public.projects`
- `public.skills`
- `public.education`
- `public.certifications`

### Administrative Write Restrictions (`public.admins`)
To prevent unauthorized users from creating, modifying, or deleting records:
1. An internal table `public.admins (user_id UUID PRIMARY KEY REFERENCES auth.users(id))` stores authorized admin user IDs.
2. An SQL security helper function validates if the current requester is an authorized admin:
   ```sql
   CREATE OR REPLACE FUNCTION public.is_admin()
   RETURNS BOOLEAN AS $$
   BEGIN
     RETURN EXISTS (
       SELECT 1 FROM public.admins
       WHERE user_id = auth.uid()
     );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```
3. All write operations (`INSERT`, `UPDATE`, `DELETE`) on all tables and storage buckets require `public.is_admin()` to return `true`.

### Granting Admin Access
To designate an authenticated user as an administrator:
```sql
INSERT INTO public.admins (user_id)
VALUES ('<YOUR_SUPABASE_AUTH_UID>')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 2. Supabase Storage Security & Policies

Uploaded media is partitioned into dedicated storage buckets:
- `profile`: Profile pictures and avatars
- `projects`: Project screenshots and preview graphics
- `education`: Institution logos
- `certifications`: Credential certificates and issuer logos
- `resumes`: PDF resume documents

### Storage RLS Policies
- **Read**: Public read access is enabled for public buckets.
- **Write/Delete**: Permitted only when `public.is_admin()` is `true`.
- **Validation**: Uploads are restricted by MIME type (`image/png`, `image/jpeg`, `image/webp`, `application/pdf`) and size limits enforced in `src/lib/services/storage.ts`.

---

## 3. Cloudflare Turnstile Bot Protection

The contact form submission endpoint (`/api/contact`) is protected against automated spam and bots using Cloudflare Turnstile.

### Validation Flow
1. The client widget renders Turnstile and receives an ephemeral verification token.
2. The token is sent alongside the contact payload to `/api/contact`.
3. The server validates the token against `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `TURNSTILE_SECRET_KEY`.
4. If validation fails or the token is missing, the request is rejected with status 400.

### Configuration
In `.env.local` / Vercel Environment Variables:
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your_cloudflare_site_key>
TURNSTILE_SECRET_KEY=<your_cloudflare_secret_key>
```

---

## 4. HTTP Headers & Content Security Policy (CSP)

Configured in `next.config.ts`:
- **Content-Security-Policy**: Enforces strict `default-src 'self'`, allowlisting only Supabase endpoints, Cloudflare Turnstile scripts (`challenges.cloudflare.com`), and Google Fonts.
- **X-Frame-Options**: `DENY` to prevent clickjacking.
- **X-Content-Type-Options**: `nosniff`.
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **HSTS**: `max-age=63072000; includeSubDomains; preload`.

---

## 5. Credentials Checklist

| Credential / Variable | Scope | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Public identifier |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public anon key (protected by PostgreSQL RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Secret (admin/migrations only; never exposed to browser) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Public widget identifier |
| `TURNSTILE_SECRET_KEY` | Server-only | Secret API key |
