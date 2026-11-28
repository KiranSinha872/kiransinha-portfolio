# Feature Checklist & Codebase Audit — Kiran Sinha Portfolio

> **Branch:** `redesign-v2`  
> **Status:** Hero Phase Complete (Intro Loader, Flip Calendar, Verlet Physics Pull-Cord, Hero Layout, Cut-Out Portrait)  
> **Rule:** Every item in this checklist must continue to function seamlessly throughout and following the redesign.

---

## Phase Progress Status
- [x] **Phase 1 Foundations:** Design tokens, Lenis smooth scrolling, Onest font (`Bebas Neue` for K/S logo only), theme switching infrastructure, and layout shell.
- [x] **Header Tagline Fix:** Replaced clipping truncate on desktop with full untruncated display when space permits (`xl:inline-block`), hidden below `xl` for clean balance.
- [x] **Intro Loader:** Staggered sliding discipline pills (Kiran Sinha, Full-Stack Development, Data Structures & Algorithms, AI & Machine Learning, React & Next.js Builder, Problem Solver) + 000-100 numeric counter. Controlled by `sessionStorage` (once per session) and respects `prefers-reduced-motion`.
- [x] **Flip Calendar:** Spiral-notebook flip card cycling Kiran's 5 verified roles (Full-Stack Developer, AI/ML Student, React & Next.js Builder, Problem Solver, Aspiring Software Engineer) with 3D leaf flip animation and `01 / 05` counter. Supports manual click/tap and keyboard Enter/Space.
- [x] **Pull-Cord Lamp:** Canvas-based 26-node Verlet integration rope with real physics ($G = 4600\text{ px/s}^2$), pendulum damping, pointer capture, and touch dragging. Pulling past travel trips the switch and triggers View Transitions theme toggle. Loops pause when off-screen or motionless.
- [x] **Cut-Out Portrait:** Optimized copy in `public/images/my-photo.png` with atmospheric backdrop circle and floating "My developer card" button.
- [x] **Hero Actions & Bottom Bar:** "Get in touch" (smooth scrolls to `#contact`), "See my work" (smooth scrolls to `#projects`), working Resume viewer modal with download fallback, and LinkedIn link. Bottom status bar with "Available for internships", "Based in Delhi, India", and scroll hint.

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

### B. Hero Section (Implemented & Verified)
- [x] **Name & Title:** Dynamic rendering of `profile.name` ("Kiran Sinha") and title/headline.
- [x] **Bio Preview:** Dynamic rendering of `profile.bio` / `profile.about`.
- [x] **Portrait Interactive Colour Spotlight Trail:**
  - High-resolution cut-out portrait without any green circle or backdrop halo (clean cut-out photo only).
  - Greyscale at rest in both light and dark themes.
  - Soft feathered "colour spotlight" brush (radius ~90 to 125px) revealing true-colour photo under cursor on pointer move/drag.
  - Linear motion interpolation between pointer events ensuring continuous smooth streaks rather than disjoint dots.
  - Gradual fading trail (~1.6s exponential decay) allowing multiple fading trails to remain visible at once before dissolving back to grey.
  - Canvas trail mask composited via `destination-in` so colour is strictly clipped to the cut-out silhouette.
  - Animation loop automatically pauses when mask decays or portrait scrolls out of viewport (`IntersectionObserver`).
  - Small hand cursor (`cursor-pointer`) when hovering over portrait.
  - Touch support: touch drag paints spotlight streak; tap paints single spotlight.
  - Keyboard and reduced motion: static centred reveal on focus with `prefers-reduced-motion`, accessible `role="region"` and `aria-label`.
  - Floating "My developer card" button remains fully accessible.
- [x] **Resume Viewing:** "View Resume" button that opens `profile.resumeUrl` in an interactive modal with direct download support.
- [x] **Get In Touch CTA:** Primary button scrolling directly to the contact experience.
- [x] **LinkedIn Quick Link:** Direct external link to `profile.linkedinUrl` with `rel="noopener noreferrer"`.
- [x] **Spiral-Notebook Role Flip Card:**
  - Exactly four roles in sequential order: (1) Aspiring Software Engineer, (2) Full Stack Developer, (3) Problem Solver, (4) AI/ML Student.
  - Single source of truth driving index; no random picks.
  - Synchronized timer with Strict Mode unmount cleanup; manual click/tap advances and resets auto-timer.
  - Counter reads 01 / 04 to 04 / 04.
- [x] **Pull-Cord Theme Lamp:** Interactive Verlet physics pull cord switching dark/light themes.

### C. Academic & Development Journey Timeline (Phase c Implemented & Verified)
- [x] **5-Milestone Journey Chapters:**
  1. *2025 – Present:* B.Tech in Artificial Intelligence & Machine Learning at Mirai School of Technology.
  2. *2024 – 2025:* Full-Stack Systems & Algorithmic Foundations (DSA problem solving, Supabase web apps).
  3. *2023 – 2025:* Higher Secondary Science (PCMB) at Gurucharan College (Distinction).
  4. *2022 – 2023:* Secondary School Education at Surendra Singha Memorial English School (89.9% Distinction).
  5. *2021 – 2022:* First Lines of Code & Engineering Curiosity (C/C++ & Python fundamentals).
- [x] **Mechanical Odometer Year Counter:**
  - 4-digit roller (`.dg__c` digits 0–9) that mechanically rolls to the active year using cubic-bezier tumbler physics as the user scrolls through milestones.
- [x] **3D Clock Tunnel Background Canvas:**
  - 14 depth-receding 3D concentric clock rings with perspective scaling and clock face ticks, driven dynamically by scroll progress.
  - Honors `prefers-reduced-motion` and pauses off-screen.
- [x] **Vertical Progress Rail & Traveling Dot:**
  - Illuminated traveling dot with glow trail tracking scroll position down the central rail.
- [x] **Preservation of Academic & Bio Records:**
  - Retains all database education records, degrees, grades, coursework highlights, and locations.
  - Backwards-compatible `#about` and `#education` anchor IDs.

### D. Technical Skills Showcase (Phase b Implemented & Verified)
- [x] **Dynamic Data Fetching:** Render skills dynamically from Supabase database (`public.skills`).
- [x] **Category Grouping & Dynamic Tabs:**
  - Dynamic tabs list generated from real Supabase skill categories (`Programming`, `Backend`, `Database`, `Frontend`, `Data Science`, `Tools`, etc. — handles any number of categories gracefully).
  - "All Disciplines" master view plus single-discipline focus views.
  - Category count pills showing real item counts.
- [x] **Animated Reveal & Skill Cards:**
  - Staggered entry animation on category tab selection (`AnimatePresence` + `motion.div`).
  - Real SVG brand icons with brand hex colors (simple-icons) and accessible fallback glyphs.
  - Real proficiency percentage indicators only when present in database (no invented metrics or numbers).
  - Respects `prefers-reduced-motion: reduce`.
- [x] **Real-Time Subscription:** Maintains `subscribeToSkills` so admin deletions, creations, and edits propagate live without page reloads.

### E. Projects & Showcase (Phase a Implemented & Verified)
- [x] **Interactive Roman Arch Project Doors Wall:**
  - Architecture matching reference site: Roman arch geometry (`50cqi 50cqi 0 0`), casing molding with multi-tier inset drop shadows.
  - Authentic door leaves with vertical micro-fluting, brass nameplates with debossed lettering and screw rivets, and antique brass lever handles with keyhole escutcheons.
  - Dynamic doors generated from real Supabase projects data (3 to 6 doors, prioritizes `featured` and `order`).
  - Spring-loaded hover interaction cracking the door open (`rotateY(10deg)`), revealing illuminated project artwork inside `.room`, glowing `.sill`, and warm light floor spill (`.pool`).
  - Floating circular cursor badge (`#doorCursor`) following mouse with smooth transitions.
  - Click swings door wide (`rotateY(70deg)`) and launches Project Overview Panel.
  - Full container query responsiveness (`cqi`), keyboard navigation, and `prefers-reduced-motion` fallbacks.
- [x] **Project Overview Panel (Modal Dialog):**
  - Project index (`PROJECT 01 / 03`), title, tagline, what it does, and problem it solves.
  - Individualized tech stack tags (`project.tags`).
  - Extruded 3D desktop monitor mockup with realistic bezel, webcam dot, screen glare overlay, and dynamic mouse tilt easing using real project screenshots (`thumbnailUrl`).
  - Action buttons: "Live Demo" and "Source Code" (only rendered when URL exists).
  - Keyboard navigation (Left/Right arrow keys to cycle projects, ESC to close, Tab focus trapping).
  - Tap-friendly mobile flow and accessible `role="dialog"`.
- [x] **Archive Page Preservation:**
  - "View all projects →" link seamlessly routing to `/projects` archive page.
  - Dedicated `/projects` page preserved with individual project cards and stack tags.

### F. Certifications & Credentials (Phase f Implemented & Verified)
- [x] **Credential Cards:** Display of all certifications from `public.certifications` with Onest typography.
- [x] **Issuer & Date:** Clear badge/issuer name, issue date, and credential ID.
- [x] **Verification Link:** External link to verify credential on issuing authority (`credentialUrl`) with `rel="noopener noreferrer"`.

### G. Competitive Programming & Developer Profiles (Phase f Implemented & Verified)
- [x] **Coding Platforms:**
  - GitHub (`profile.githubUrl` / `@KiranSinha872`)
  - LeetCode (`profile.leetcodeUrl` / handle)
  - CodeChef (`profile.codechefUrl` / handle)
  - Codeforces (`profile.codeforcesUrl` / handle)
- [x] **External Links:** Direct links to live coder profiles with outbound icon indicators and platform descriptions.

### H. Interactive Developer Ability Card (Phase d Implemented & Verified)
- [x] **Holographic 3D Developer Ability Card (`#holo`, `#hc`):**
  - Triggered via "My developer card" button on hero portrait chest badge.
  - Authentic 3D trading card with responsive mouse/touch tilt physics (`rotateX`, `rotateY`, `perspective: 1200px`).
  - Dynamic holographic rainbow foil layer, sheen glare highlight, and light reflection sheen (`mix-blend-color-dodge`).
  - Interactive tap or click to flip 180° (`preserve-3d` with smooth cubic-bezier transition).
  - Front Face: framed portrait, name, AIML student credentials, verified specialization tags, limited edition metadata.
  - Back Face: verified passport with Mirai School of Technology enrollment, location badges, and direct external links to GitHub and LeetCode profiles.
  - Accessible modal dialog: ESC key to close, backdrop click, dedicated close button, `role="dialog"`, `aria-modal="true"`, body scroll locking, and `prefers-reduced-motion` compliance.

### I. Contact & Guided Questionnaire Experience (Phase e Implemented & Verified)
- [x] **5-Step Interactive Guided Questionnaire:**
  - Step 1: Opportunity Scope (*Full-Time Engineering*, *Internship / Co-op*, *Project / Contract*, *Open-Source & Research*).
  - Step 2: Target Timeline (*Immediately*, *Within 1–3 Months*, *Flexible / Planning*).
  - Step 3: Technology Focus (*Full-Stack / Next.js*, *AI & Machine Learning*, *Backend & Databases*, *Algorithms & Systems*).
  - Step 4: Organization Type (*Fast-Paced Startup*, *Established Enterprise*, *Research Lab*, *Direct Builder*).
  - Step 5: Contact Information (Name, Email, optional extra details).
- [x] **Security & Validation Defense:**
  - Preserves Cloudflare Turnstile CAPTCHA server-side validation.
  - Preserves IP-based in-memory rate limiting (maximum 5 requests per 10 minutes).
  - Preserves Zod schema validation & HTML sanitization via `contactMessageSchema`.
- [x] **Database & Feedback Integration:**
  - Server-side insertion into Supabase `contact_messages` table via existing `/api/contact` endpoint.
  - Immediate visual feedback: step progress bar (`STEP 01 / 05` to `05 / 05`), loading spinner, error banner, and confirmation screen.
- [x] **Direct Contact Channels:**
  - One-click copy email button with clipboard confirmation.
  - Direct links to LinkedIn and GitHub.

### J. Architectural Footer & Back-to-Top (Phase f Implemented & Verified)
- [x] **Giant Viewport Wordmark:** Fluid responsive `KIRAN SINHA` wordmark auto-scaled to viewport width.
- [x] **Circular Progress Back-To-Top Button:** Interactive SVG circular scroll progress ring tracking page depth with smooth scroll-to-top handler.
- [x] **Credits & Administration:**
  - "Design inspired by Rishi Thakor" credit.
  - Copyright statement and social icon links.
  - Discreet lock icon linking to `/admin/login`.

### K. Admin Portal & Data Management
- [ ] **Authentication:** Supabase Auth session guard with middleware protection.
- [ ] **CRUD Operations:** Preserved management for Profile, Skills, Projects, Certifications, Education, and Contact Messages.
- [ ] **Cache Invalidation:** Server action `revalidatePortfolio()` triggered on administrative writes.
