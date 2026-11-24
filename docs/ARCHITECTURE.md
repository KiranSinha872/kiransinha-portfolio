# Portfolio Architecture & Directory Map

## Overview
This codebase is a modern personal portfolio and content management system built with Next.js (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, and Supabase (PostgreSQL 15, Supabase Auth, Supabase Storage, and Realtime).

All application logic resides under `src/`, adhering to a strict separation of concerns, single-responsibility components, and modular services.

---

## Directory Structure

```
├── .env.example                     # Canonical environment variables template
├── docs/                            # Architectural, security, and audit documentation
│   ├── ARCHITECTURE.md              # System design and folder map (this document)
│   ├── AUDIT.md                     # Security and codebase audit report
│   ├── design-notes.md              # Design system and typography specifications
│   └── SECURITY.md                  # Security policies, RLS, and Turnstile documentation
├── next.config.ts                   # Next.js security headers, CSP, and build configuration
├── package.json
├── public/                          # Static assets only (robots/favicon managed in src/app)
├── supabase/                        # Database schema migrations & SQL setup
│   └── migrations/                  # Versioned schema definitions and RLS policies
├── src/
│   ├── app/                         # Next.js App Router (pages, layouts, metadata)
│   │   ├── (public)/                # Public portfolio route group
│   │   │   ├── layout.tsx           # Public shell (Header + Footer)
│   │   │   └── page.tsx             # Main single-page portfolio layout
│   │   ├── admin/                   # Admin dashboard route group
│   │   │   ├── dashboard/page.tsx   # Authenticated CRUD management dashboard
│   │   │   ├── login/page.tsx       # Admin authentication sign-in
│   │   │   ├── layout.tsx           # Admin shell with AuthProvider guard
│   │   │   └── page.tsx             # Redirect to /admin/dashboard
│   │   ├── api/                     # Serverless Route Handlers
│   │   │   └── contact/route.ts     # Contact form API with Turnstile and rate limiting
│   │   ├── apple-icon.png           # Next.js auto-handled Apple touch icon
│   │   ├── error.tsx                # Global error boundary
│   │   ├── favicon.ico              # Standard browser favicon
│   │   ├── globals.css              # Global styles & Tailwind directives
│   │   ├── icon.png                 # Standard PNG app icon
│   │   ├── layout.tsx               # Root HTML layout with fonts and metadata
│   │   ├── not-found.tsx            # Custom 404 handler
│   │   ├── opengraph-image.tsx      # Dynamic Edge Open Graph image generator
│   │   ├── robots.ts                # Auto-generated robots.txt with admin disallow
│   │   ├── sitemap.ts               # Auto-generated XML sitemap
│   │   └── twitter-image.tsx        # Dynamic Twitter card image generator
│   ├── components/
│   │   ├── admin/                   # Admin manager panels & sub-modals
│   │   │   ├── CertificationFormModal.tsx
│   │   │   ├── CertificationsManager.tsx
│   │   │   ├── ContactManager.tsx
│   │   │   ├── EducationFormModal.tsx
│   │   │   ├── EducationManager.tsx
│   │   │   ├── ProfileBadgesSection.tsx
│   │   │   ├── ProfileBioSection.tsx
│   │   │   ├── ProfileManager.tsx
│   │   │   ├── ProfileMediaSection.tsx
│   │   │   ├── ProfileSocialsSection.tsx
│   │   │   ├── ProjectAdminCard.tsx
│   │   │   ├── ProjectFormModal.tsx
│   │   │   ├── ProjectsManager.tsx
│   │   │   ├── SkillFormModal.tsx
│   │   │   └── SkillsManager.tsx
│   │   ├── layout/                  # Navigation & layout chrome
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   ├── motion/                  # Animation wrappers (FadeIn)
│   │   ├── sections/                # Public portfolio sections
│   │   │   ├── About.tsx
│   │   │   ├── CertificationsSection.tsx
│   │   │   ├── CodingProfilesSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   ├── EducationSection.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   └── SkillsSection.tsx
│   │   └── ui/                      # Reusable UI widgets & modals
│   │       ├── Container.tsx
│   │       ├── ImageCropModal.tsx
│   │       ├── PlatformIcons.tsx
│   │       ├── ProjectCard.tsx
│   │       ├── ResumeViewerModal.tsx
│   │       ├── SkillBadge.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── env.ts                   # Central Zod schema validating env vars
│   │   ├── security/                # Sanitization, input validation, and limits
│   │   ├── services/                # Supabase database & storage service abstractions
│   │   │   ├── certifications.ts
│   │   │   ├── contact.ts
│   │   │   ├── education.ts
│   │   │   ├── firestore.ts         # Facade re-exporting domain services
│   │   │   ├── profile.ts
│   │   │   ├── projects.ts
│   │   │   ├── skills.ts
│   │   │   └── storage.ts           # Supabase Storage uploaders (strict validation)
│   │   ├── supabase/                # Supabase client instances & Auth Context
│   │   │   ├── auth-context.tsx     # React Context for Supabase Auth & admin state
│   │   │   ├── client.ts            # Browser client (createBrowserClient)
│   │   │   └── server.ts            # Server-side client utilities
│   │   └── utils/                   # Shared utility helpers (crop, skill icons)
│   └── types/                       # Shared TypeScript domain models & interfaces
│       └── index.ts
├── tests/                           # Unit tests for security, auth, and data mappers
│   ├── auth.test.ts
│   ├── contact.test.ts
│   └── mappers.test.ts
└── tsconfig.json
```

---

## Architectural Principles

1. **Separation of Concerns**:
   - `src/lib/services/` encapsulates all database queries and storage operations.
   - UI components interact with service functions, never directly invoking raw SQL or queries.
2. **PostgreSQL & Row Level Security (RLS)**:
   - Data access is governed by PostgreSQL RLS.
   - Public users have read access to public tables (`profile`, `projects`, `skills`, `education`, `certifications`).
   - Mutations (`INSERT`, `UPDATE`, `DELETE`) are strictly permitted only for authenticated users whose `id` exists in the `public.admins` table.
3. **Storage Security**:
   - Files are stored in dedicated Supabase Storage buckets with strict MIME type and file size limits.
   - Binary uploads are streamed directly to Supabase Storage; URLs are stored in database records.
4. **Bot Protection**:
   - The `/api/contact` endpoint utilizes Cloudflare Turnstile token validation along with in-memory IP rate limiting.
