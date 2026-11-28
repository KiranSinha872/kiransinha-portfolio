# Feature Checklist & Codebase Audit — Kiran Sinha Portfolio

> **Branch:** `redesign-v2`  
> **Status:** Phase 1 Complete (Foundations, Design Tokens, Layout Shell, Lenis Smooth Scroll, Theme Switching)  
> **Rule:** Every item in this checklist must continue to function seamlessly throughout and following the redesign.

---

## Phase 1 Progress Status
- [x] **Dependencies:** Installed `lenis` smooth scrolling without disturbing any existing dependencies.
- [x] **Typography:** Downloaded `'Onest'` font (`onest-latin.woff2`, `onest-latin-ext.woff2`) into `public/fonts/` and integrated via `next/font/local`. Preserved `'Bebas Neue'` strictly for the `K/S` brand monogram.
- [x] **Design Tokens:** Added comprehensive light (`#E8E4E0`) and dark (`#1A1818`) dual-theme color tokens, spring and soft easing curves, adaptive rem grid scaling, border radii, and `.shell` container classes to `src/app/globals.css`.
- [x] **Theme Switcher:** Created `ThemeProvider` with View Transitions API crossfade animation (`::view-transition-old(root)`, `::view-transition-new(root)`), localStorage persistence (`theme-mode`), and fallback for browsers without native view transitions.
- [x] **Smooth Scrolling:** Created `SmoothScroll` provider wrapping Lenis with inertial dampening and `prefers-reduced-motion` compliance.
- [x] **Navigation Shell:** Updated `PublicHeader` with live local-time pill (`Delhi, IN` with Asia/Kolkata timezone ticker), Bebas Neue `K/S` monogram, theme toggle button, and responsive mobile drawer.
- [x] **Footer Shell:** Updated `PublicFooter` with `Design inspired by Rishi Thakor` credit, social links, and discreet admin login link.
- [x] **Backward Compatibility:** All existing sections (`Hero`, `About`, `SkillsSection`, `ProjectsSection`, `CertificationsSection`, `EducationSection`, `CodingProfilesSection`, `ContactSection`) remain 100% functional and accessible inside the new shell.

---

## 1. Technical Stack & Environment

- **Framework:** Next.js 16.3.4 (App Router)
- **React Version:** React 19.2.8 (`react`, `react-dom`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss: ^4`, `tailwindcss: ^4`) with PostCSS
- **Animation Engine:** Framer Motion `^13.2.0`
- **Icon Libraries:** Lucide React `^1.39.0`, Simple Icons `^16.38.1`
- **Database & Auth:** Supabase (`@supabase/supabase-js: ^2.119.2`, `@supabase/ssr: ^0.12.7`) on PostgreSQL
- **Data Validation:** Zod `^4.6.7`
- **Security & Bot Protection:** Cloudflare Turnstile CAPTCHA (`TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) + In-memory IP rate limiting
- **Package Manager:** npm `11.16.0` (`package-lock.json`)
- **Build Tool:** Turbopack (`next build`, `next dev`)
- **Node Engine:** `>=20.0.0` (`.nvmrc: 22`, active runtime: `v26.3.0`)
- **Testing:** Node test runner with `tsx` (`npm test`: 27 passing tests across auth, contact validation, and Supabase data mappers)

---

## 2. Directory Structure & Architecture

```
Portfolio_kiran/
├── .env.example / .env.local       # Environment variables
├── next.config.ts                  # CSP headers, Turbopack root, remote image patterns
├── package.json                    # Dependencies & scripts
├── docs/                           # Architecture, audit, and design documentation
├── public/                         # Static assets (images, icons, etc.)
│   └── images/hero-kiran.png       # Primary hero portrait
├── src/
│   ├── middleware.ts               # Admin route authentication & proxy redirects
│   ├── types/index.ts              # Data contracts: Profile, Project, Skill, Education, Certification, ContactMessage
│   ├── app/
│   │   ├── layout.tsx              # Root HTML wrapper with fonts, metadata, OpenGraph, viewport
│   │   ├── globals.css             # Base styles, Tailwind directives, theme variables
│   │   ├── sitemap.ts / robots.ts  # Dynamic SEO crawlers
│   │   ├── opengraph-image.tsx     # Dynamic social preview card
│   │   ├── twitter-image.tsx       # Dynamic Twitter card
│   │   ├── (public)/
│   │   │   ├── layout.tsx          # Public wrapper with Header & Footer
│   │   │   ├── page.tsx            # Main Portfolio Page (SSR with ISR revalidate = 60s)
│   │   │   └── projects/page.tsx   # Standalone "/projects" archive page
│   │   ├── admin/
│   │   │   ├── login/page.tsx      # Admin authentication portal
│   │   │   ├── dashboard/page.tsx  # Admin CRUD tabs (Profile, Education, Skills, Certs, Projects, Contact)
│   │   │   └── layout.tsx          # Admin layout with auth guard & side navigation
│   │   ├── api/
│   │   │   └── contact/route.ts    # POST endpoint with IP rate limiting & Turnstile validation
│   │   └── actions/revalidate.ts   # On-demand ISR revalidation server action
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Public desktop/mobile navigation & brand logo
│   │   │   ├── Footer.tsx          # Public footer with socials & discreet admin link
│   │   │   ├── AdminHeader.tsx     # Admin dashboard header
│   │   │   └── AdminSidebar.tsx    # Admin dashboard sidebar navigation
│   │   ├── sections/
│   │   │   ├── Hero.tsx            # Section 1: Hero portrait, headline, bio, actions
│   │   │   ├── About.tsx           # Section 2: Bio narrative, location, focus area, mindset
│   │   │   ├── SkillsSection.tsx   # Section 3: Grouped technical skill tags (real-time synced)
│   │   │   ├── ProjectsSection.tsx # Section 4: Top 3 selected projects + "View all projects →"
│   │   │   ├── CertificationsSection.tsx # Section 5: Verified licenses & credentials
│   │   │   ├── EducationSection.tsx      # Section 6: Academic history & achievements
│   │   │   ├── CodingProfilesSection.tsx # Section 7: Competitive programming (LeetCode, CodeChef, etc.)
│   │   │   └── ContactSection.tsx        # Section 8: "LET'S CONNECT" message form
│   │   ├── ui/
│   │   │   ├── ProjectCard.tsx     # Individual project card with thumbnail, stack, links
│   │   │   ├── PublicResumeModal.tsx # PDF resume modal with download button
│   │   │   ├── PlatformIcons.tsx   # SVG icons for GitHub, LinkedIn, etc.
│   │   │   └── Toast.tsx           # Interactive toast notifications
│   │   └── admin/                  # Modular CRUD managers and modals for all sections
│   └── lib/
│       ├── env.ts                  # Safe environment variable validation
│       ├── security/validation.ts  # Zod schemas & sanitization logic
│       ├── supabase/               # Client, server, and auth-context helpers
│       └── services/               # Data layer methods for all domain entities
└── tests/                          # 27 automated unit/integration tests
```

---

## 3. Preservation Checklist: Links, Behaviors & Functionality

### A. Navigation & Shell
- [ ] **Brand / Logo:** Responsive logo linking to `/` (home).
- [ ] **Section Jump Links:** Smooth scrolling to `#about`, `#skills`, `#projects`, `#certifications`, `#education`, `#coding-profiles`, `#contact`.
- [ ] **Mobile Navigation:** Responsive drawer/overlay menu toggle accessible on touch screens.
- [ ] **Discreet Admin Access:** Retain subtle footer link to `/admin/login` for portfolio management.

### B. Hero Section
- [ ] **Name & Title:** Dynamic rendering of `profile.name` ("Kiran Sinha") and title/headline.
- [ ] **Bio Preview:** Dynamic rendering of `profile.bio` / `profile.about`.
- [ ] **Portrait Asset:** High-resolution portrait display (`/images/hero-kiran.png`).
- [ ] **Resume Viewing:** "View Resume" button that opens `profile.resumeUrl` in an interactive modal with direct download support.
- [ ] **Get In Touch CTA:** Primary button scrolling directly to the contact experience.
- [ ] **LinkedIn Quick Link:** Direct external link to `profile.linkedinUrl` with `rel="noopener noreferrer"`.

### C. About Section
- [ ] **Detailed Bio:** Comprehensive narrative from `profile.bio` / `profile.about`.
- [ ] **Context Chips:**
  - Location badge (e.g., "Based in Delhi / Silchar, India")
  - Focus Area badge (e.g., "Artificial Intelligence & Machine Learning")
  - Mindset / Status badge (e.g., "Available for Opportunities")

### D. Technical Skills & Doors
- [ ] **Dynamic Data Fetching:** Render skills dynamically from database (`public.skills`).
- [ ] **Category Grouping:** Full preservation of dynamic categories (Programming, Backend, Database, Frontend, Data Science, Tools, etc.).
- [ ] **Skill Badges / Proficiency:** Skill name, proficiency percentage (e.g. 90%), and icon representation.
- [ ] **Real-Time Subscription:** Maintain `subscribeToSkills` so admin deletions and creations propagate immediately without page reloads.

### E. Projects & Showcase
- [ ] **Featured vs. All Projects:**
  - Landing page showcases the top 3 featured projects.
  - "View all projects →" button redirects to the dedicated `/projects` archive page.
- [ ] **Per-Project Tech Stack:** Every project card must individually display its specific technologies/tags (`project.tags`).
- [ ] **Live Demo Links:** External link to `project.liveUrl` (with target `_blank`).
- [ ] **Source Code Links:** External link to `project.repoUrl` (GitHub repository).
- [ ] **Project Thumbnails:** Dynamic thumbnail image from Supabase storage or remote URL.

### F. Certifications & Credentials
- [ ] **Credential List:** Display of all certifications from `public.certifications`.
- [ ] **Issuer & Date:** Clear badge/issuer name, issue date, and credential ID.
- [ ] **Verification Link:** External link to verify credential on issuing authority (`credentialUrl`).

### G. Academic Journey / Education
- [ ] **Timeline Data:** Display of institutions (`Mirai School of Technology`, `Gurucharan College`, `Surendra Singha Memorial School`), degrees, fields of study, dates, and locations.
- [ ] **Academic Highlights:** Display of grades (e.g., "89.9% First Division with Distinction") and relevant coursework.

### H. Competitive Programming & Developer Profiles
- [ ] **Coding Platforms:**
  - GitHub (`profile.githubUrl` / `@kiransinha`)
  - LeetCode (`profile.leetcodeUrl` / handle)
  - CodeChef (`profile.codechefUrl` / handle)
  - Codeforces (`profile.codeforcesUrl` / handle)
- [ ] **External Links:** Direct links to live coder profiles with outbound icon indicators.

### I. Contact & Questionnaire Experience
- [ ] **Submission Endpoint:** POST to `/api/contact`.
- [ ] **Security Checks:**
  - Cloudflare Turnstile token verification (server-side).
  - In-memory IP rate limiting (maximum 5 submissions per 10 minutes).
  - Zod schema validation & input sanitization (strip HTML & control characters).
- [ ] **Database Insertion:** Secure server-side insertion into `contact_messages` table.
- [ ] **State Feedback:** Immediate loading spinner, descriptive error messages, and success confirmation screen.
- [ ] **Direct Contact Channels:**
  - Email mailto link (`profile.contactEmail` / `profile.email`)
  - Phone link (`profile.phone`, if configured)
  - LinkedIn direct link

### J. Admin Portal & Data Management
- [ ] **Authentication:** Supabase Auth session guard with middleware protection.
- [ ] **CRUD Operations:** Preserved management for Profile, Skills, Projects, Certifications, Education, and Contact Messages.
- [ ] **Cache Invalidation:** Server action `revalidatePortfolio()` triggered on administrative writes.
