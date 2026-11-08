# Portfolio Architecture & Directory Map

## Overview
This codebase is a modern personal portfolio and content management system built with Next.js (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, and Google Firebase (Client SDK, Firestore, Cloud Storage, Authentication).

All application logic resides under `src/`, adhering to a strict separation of concerns, single-responsibility components, and modular services.

---

## Directory Structure

```
├── .env.example                     # Canonical environment variables template
├── docs/                            # Architectural, security, and audit documentation
│   ├── AGENTS.md                    # Antigravity / Next.js guidelines
│   ├── ARCHITECTURE.md              # System design and folder map (this document)
│   ├── AUDIT.md                     # Security and codebase audit report
│   ├── CLAUDE.md                    # Historical commands & guidelines
│   ├── design-notes.md              # Design system and typography specifications
│   └── SECURITY.md                  # Security policies, key rotation, and checklist
├── firestore.rules                  # Strict server-side Firestore security rules
├── storage.rules                    # Strict server-side Cloud Storage security rules
├── next.config.ts                   # Next.js security headers and build configuration
├── package.json
├── public/                          # Static assets only (robots/favicon managed in src/app)
├── scripts/                         # Verification and test automation scripts
│   └── verify-rules-logic.mjs       # Zero-dependency Firestore rules evaluator
├── src/
│   ├── app/                         # Next.js App Router (pages, layouts, metadata)
│   │   ├── (public)/                # Public portfolio route group
│   │   │   ├── layout.tsx           # Public shell (Navbar + Footer)
│   │   │   └── page.tsx             # Main single-page portfolio layout
│   │   ├── admin/                   # Admin dashboard route group
│   │   │   ├── dashboard/page.tsx   # Authenticated CRUD management dashboard
│   │   │   ├── login/page.tsx       # Admin authentication sign-in
│   │   │   ├── layout.tsx           # Admin shell with AuthProvider guard
│   │   │   └── page.tsx             # Redirect to /admin/dashboard
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
│   │   ├── backgrounds/             # Interactive canvas & background video components
│   │   │   ├── CodingProfilesVideoBackground.tsx
│   │   │   ├── HeroBirdsBackground.tsx
│   │   │   └── HlsBackgroundVideo.tsx
│   │   ├── layout/                  # Navigation & layout chrome
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   ├── motion/                  # Reusable Framer Motion animation primitives
│   │   │   ├── AnimatedText.tsx
│   │   │   ├── FadeIn.tsx
│   │   │   └── Magnet.tsx
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
│   │       ├── ImageCropModal.tsx
│   │       ├── PlatformIcons.tsx
│   │       ├── ProjectCard.tsx
│   │       ├── ResumeViewerModal.tsx
│   │       ├── SkeletonLoaders.tsx
│   │       ├── SkillBadge.tsx
│   │       ├── StatCard.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── env.ts                   # Central Zod schema validating env vars
│   │   ├── firebase/                # Client Firebase initialization & Auth Context
│   │   │   ├── auth-context.tsx     # React Context for Firebase Auth state
│   │   │   └── client.ts            # Client App & App Check initialization
│   │   ├── security/                # Sanitization, input validation, and limits
│   │   ├── services/                # Firestore and Storage service abstractions
│   │   │   ├── certifications.ts
│   │   │   ├── contact.ts
│   │   │   ├── converter.ts
│   │   │   ├── education.ts
│   │   │   ├── firestore.ts         # Unified service re-export
│   │   │   ├── profile.ts
│   │   │   ├── projects.ts
│   │   │   ├── skills.ts
│   │   │   └── storage.ts           # Cloud Storage uploaders (strict validation)
│   │   └── utils/                   # Shared utility helpers (e.g. crop.ts)
│   │       └── crop.ts
│   └── types/                       # Shared TypeScript domain models & interfaces
│       └── index.ts
├── tests/                           # Unit tests for security rules & services
│   └── firestore-rules.test.ts
└── tsconfig.json
```

---

## Module Boundaries and Responsibilities

1. **`src/app/`**:
   - Contains only Next.js routing files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and route handlers.
   - Route groups separate public presentation `(public)` from administrative actions `admin/`.
   - Never directly executes database mutation queries; delegates to `src/lib/services/`.

2. **`src/components/sections/`**:
   - Each file represents an independent presentation section of the main landing page.
   - Fetches data through `src/lib/services/firestore.ts` and gracefully handles loading and error states.

3. **`src/components/admin/`**:
   - Contains administrative management interfaces for each portfolio entity.
   - Complex interfaces (forms, modals, cards) are split into dedicated sub-components under 300 lines.

4. **`src/lib/services/`**:
   - Clean data-access layer wrapping Firebase Firestore and Cloud Storage.
   - Implements Firestore `DataConverter` with `toFirestore` and `fromFirestore` handlers for runtime type safety.
   - Never falls back to storing binary data in document fields.

5. **`src/lib/env.ts`**:
   - Single point of entry for environment variables.
   - Uses Zod schema parsing to guarantee fast failure at initialization if required environment variables are absent.

6. **`src/lib/firebase/`**:
   - Initializes the client-side Firebase application.
   - Manages optional Firebase App Check with reCAPTCHA v3 and developer debug token support.
   - Supplies `AuthProvider` and `useAuth` hook for client components.
