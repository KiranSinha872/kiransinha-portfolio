# Kiran Sinha — Personal Portfolio & CMS

> High-performance personal portfolio and dynamic administrative content management system built with Next.js (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20Storage-3ECF8E?logo=supabase)](https://supabase.com/)

---

## ✨ Features

- **Public Presentation**:
  - Editorial hero header with clean typography, dynamic tagline, and current year display.
  - Video showcase and responsive coding profiles featuring LeetCode, CodeChef, Codeforces, and GitHub.
  - Dynamic skill badges categorized into Frontend, Backend, Tools & Cloud, and Core CS.
  - Featured projects with live preview links, GitHub repositories, and full-screen image preview.
  - Interactive timeline views for education and verified certification credentials.
  - Secure contact form with server-side validation, rate limiting, and Cloudflare Turnstile bot protection.
- **Administrative CMS (`/admin`)**:
  - Secure dashboard for updating profile details, avatar photos, resume documents, and social links.
  - Interactive client-side image cropper with custom aspect ratios (`16:9`, `4:3`, `1:1`).
  - Full CRUD operations over skills, projects, certifications, education, and contact submissions.
- **Security & Reliability**:
  - PostgreSQL Row Level Security (RLS) policies enforcing public read and strict admin-only write access via `public.admins`.
  - Supabase Storage buckets (`profile`, `projects`, `education`, `certifications`, `resumes`) with explicit RLS rules and size limits.
  - Cloudflare Turnstile bot verification on the contact endpoint.
  - Strict Content Security Policy (CSP), HSTS, X-Content-Type-Options, and Referrer-Policy headers.
  - Admin routes protected with `noindex` robots directives and `Cache-Control: no-store`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Database & Storage**: Supabase (PostgreSQL 15 & S3-Compatible Storage)
- **Authentication**: Supabase Auth (Email/Password with role verification via `public.admins`)
- **Bot Protection**: Cloudflare Turnstile
- **Validation**: Zod (Environment variables & Form input)

---

## 📁 Folder Structure

All application source code resides under `src/`:

```
├── .env.example                     # Environment template with documentation
├── docs/                            # Architectural, security, and audit reports
│   ├── ARCHITECTURE.md              # Detailed system design and directory breakdown
│   ├── AUDIT.md                     # Codebase vulnerability and structure audit
│   └── SECURITY.md                  # Security policies, RLS, and Turnstile configuration
├── supabase/                        # Supabase SQL schema migrations and seed scripts
├── public/                          # Static public assets
├── src/
│   ├── app/                         # App Router (pages, layouts, dynamic OG/Twitter metadata)
│   │   ├── (public)/                # Public portfolio landing page
│   │   ├── admin/                   # Administrative management interfaces
│   │   └── api/                     # Serverless API endpoints (e.g. /api/contact)
│   ├── components/
│   │   ├── admin/                   # Admin manager interfaces and modals
│   │   ├── layout/                  # PublicHeader, PublicFooter, AdminHeader, AdminSidebar
│   │   ├── sections/                # Modular landing page sections
│   │   └── ui/                      # Reusable UI widgets, loaders, and modals
│   ├── lib/
│   │   ├── env.ts                   # Fail-fast Zod-validated environment config
│   │   ├── supabase/                # Supabase browser/server client & Auth Context
│   │   ├── services/                # Database and Storage service layer
│   │   └── utils/                   # Helper functions (crop, transforms, skill icons)
│   └── types/                       # Shared TypeScript type definitions
└── tests/                           # Unit tests (auth, contact, mappers)
```

---

## ⚙️ Environment Variables

Create `.env.local` based on `.env.example`:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Supabase Project URL (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Supabase Anon Public API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only (Optional) | Supabase Service Role Secret Key (admin/migrations) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public / Client | Cloudflare Turnstile Site Key for bot verification |
| `TURNSTILE_SECRET_KEY` | Server-only | Cloudflare Turnstile Secret Key for backend token verification |

---

## 🚀 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KiranSinha872/kiransinha-portfolio.git
   cd kiransinha-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase and Turnstile configuration values in .env.local
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment

### 1. Deploy to Vercel
1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In Project Settings > **Environment Variables**, add the variables from `.env.example`.
4. Deploy.

### 2. Supabase Database Setup
1. Apply the schema in `supabase/migrations/` using the Supabase SQL Editor.
2. Register your admin user ID in the `public.admins` table:
   ```sql
   INSERT INTO public.admins (user_id) VALUES ('<YOUR_SUPABASE_AUTH_UID>') ON CONFLICT (user_id) DO NOTHING;
   ```

---

## 🔒 Security Hardening

For complete security instructions, RLS policies, and Turnstile configuration, refer to [docs/SECURITY.md](docs/SECURITY.md).

---

## 📄 License

MIT © [Kiran Sinha](https://github.com/KiranSinha872)
