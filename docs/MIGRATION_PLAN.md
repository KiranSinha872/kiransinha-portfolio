# Section-by-Section Migration Plan: Kiran Sinha Portfolio Redesign

> **Target Branch:** `redesign-v2`  
> **Source Portfolio:** `https://kiransinha-portfolio.vercel.app/`  
> **Design Blueprint:** `https://therishithakor.com/` (See [docs/REFERENCE_SPEC.md](file:///Users/kiransinha/Desktop/Portfolio_kiran/docs/REFERENCE_SPEC.md))  
> **Feature Preservation:** [docs/FEATURE_CHECKLIST.md](file:///Users/kiransinha/Desktop/Portfolio_kiran/docs/FEATURE_CHECKLIST.md)

---

## 1. Overview & Architectural Principles

The redesign transforms the portfolio into an interactive, physics-driven developer showcase inspired by `therishithakor.com` while maintaining:
1. **Zero Downtime / Zero Broken Commits:** The site must compile, pass all 27 automated tests (`npm test`), and build without warnings or type errors at every stage.
2. **Preservation of All Existing Data & Integrations:**
   - Supabase database collections (`profile`, `skills`, `projects`, `education`, `certifications`, `contact_messages`).
   - Admin CMS portal (`/admin/dashboard`, `/admin/login`) and real-time subscription mechanisms.
   - Cloudflare Turnstile bot verification and server-side rate-limited contact API (`/api/contact`).
   - Dynamic resume preview modal and downloadable PDF.
   - External links (GitHub, LinkedIn, LeetCode, CodeChef, Codeforces, Project Live Demos & Repos).
3. **Core Modern Stack:**
   - Next.js 16.3.4 (App Router) + React 19
   - Tailwind CSS v4
   - Framer Motion `^13.2.0`
   - `@studio-freight/lenis` / `lenis/react` for smooth inertial scrolling
   - HTML5 Canvas for Verlet rope simulation and 3D clock tunnel
   - Native View Transitions API for theme crossfades

---

## 2. Comprehensive Section Mapping

### 1. Navigation Shell & Theme Switcher
- **Reference Element:** Header with digital time/year ticker + Verlet rope pull cord (`#cord`, `#cordHit`).
- **Kiran's Implementation:**
  - Dynamic local time clock (`data-ftime`) and copyright year (`data-fyear`).
  - Interactive ceiling pull cord rendered via HTML5 `<canvas>` simulating a 26-node Verlet rope with physical gravity and snap toggle.
  - Smooth light/dark mode crossfade using `document.startViewTransition`.
  - Full-screen animated overlay menu drawer for mobile and desktop navigation.
  - Discreet admin login link preserved in footer.

### 2. Intro Staggered Loader & Hero Section
- **Reference Element:** 6-pill discipline loader (`#loader`) + fluid hero typography + cut-out portrait with live status badge.
- **Kiran's Implementation:**
  - Staggered intro loader with 6 sliding pills:
    1. *Kiran Sinha*
    2. *Full-Stack Development*
    3. *Data Structures & Algorithms*
    4. *AI & Machine Learning*
    5. *Cloud & Distributed Systems*
    6. *System Design*
  - Numeric progress counter ticking `000` to `100` before revealing the page.
  - Fluid typography headline (*KIRAN SINHA*) with animated text line masks.
  - Live status indicator ("Available for Opportunities / Fall 2026").
  - Cut-out hero portrait with ambient background glow.
  - Primary CTA buttons: "Get in Touch" (scrolls to contact), "View Resume" (opens resume modal), and "LinkedIn".

### 3. Interactive Developer Ability Card
- **Reference Element:** 3D collectible trading card (`#holo`, `#hc`) with foil shine and tap-to-flip interaction.
- **Kiran's Implementation:**
  - Floating badge trigger in the hero opening the card dialog.
  - Front Face: Kiran's avatar, verified student badge, proficiency gauges (*Full-Stack: 90*, *DSA: 92*, *Cloud: 88*, *AI/ML: 85*), holographic rainbow foil, and mouse/touch 3D tilt.
  - Back Face: Developer identity, GitHub contribution statistics, LeetCode ranking, credentials, and social links.
  - Tap or click to flip 180° with CSS 3D preserve-3d transform.

### 4. Interactive Project Doors Wall & Overview Panel
- **Reference Element:** The architectural doors (`#works`, `#dinfo`) with spring physics, hover crack-open, cursor follower, and swing-open on click.
- **Kiran's Implementation (Plan Updated):**
  - Interactive doors dynamically generated from real Supabase projects data (3 to 6 doors; prioritized by `featured: true` and sorted by `sort_order`).
  - Architectural styling: rich palettes per door (e.g., `#22304a`, `#4a3540`, `#3e4a3d`, `#5a3a28`), doorway depth, fluted paneling, door plate displaying project number (`01`, `02`, `03`) and title.
  - Spring-loaded hover interaction cracking the door open (`rotateY(10deg)`), accompanied by a custom cursor follower badge (`#doorCursor`).
  - Clicking a door swings it wide open (`rotateY(70deg)`), illuminates the floor sill, and opens the **Project Overview Panel**.
  - **Project Overview Panel:**
    - Stacked 3D desktop monitor mockup rendered inside the panel as the interactive preview, showing the real project screenshot (`thumbnailUrl`).
    - Extruded monitor bezel, neck, base, screen glare overlay, and dynamic mouse tilt easing.
    - Project details: number, title, tagline/short description, what it does / problem it solves, individual tech stack tags.
    - Action buttons: "Live Demo" and "GitHub Repo" (only displayed when the corresponding URLs exist in the database).
    - Close button, ESC key handler, focus trapping, and tap-friendly touch flow for mobile.
    - "View all projects →" link to `/projects` archive page.

### 5. Technical Skills Showcase (Categorized Tabs & Animated Reveal)
- **Reference Element:** Dedicated competencies showcase adapted for clean developer presentation.
- **Kiran's Implementation:**
  - Category tabs/list driven dynamically by Supabase skill categories (`Programming`, `Backend`, `Database`, `Frontend`, `Data Science`, `Tools`, etc. — handles any number of categories gracefully).
  - Animated reveal of each category's skills with clean tag layout.
  - No fixed hardcoded domains and no invented proficiency numbers or fake metrics.

### 6. Time-Travel Academic & Development Journey
- **Reference Element:** 5-chapter story timeline (`#about`) with 3D clock tunnel canvas and rolling mechanical odometer year.
- **Kiran's Implementation:**
  - 5 milestone chapters:
    1. *2025 – Present:* B.Tech in Artificial Intelligence & Machine Learning at Mirai School of Technology.
    2. *2024 – 2025:* Full-Stack & Algorithm Mastery (DSA problem solving, Supabase web apps).
    3. *2023 – 2025:* Higher Secondary Science (PCMB) at Gurucharan College (Distinction).
    4. *2022 – 2023:* Secondary Education at Surendra Singha Memorial English School (89.9% Distinction).
    5. *Early Beginnings:* First lines of code in C/C++ and Python.
  - 3D rotating clock tunnel background with focal perspective and drifting dust particles.
  - Vertical journey line with traveling glowing dot (`.story__dot`) and light trail.
  - Mechanical rolling odometer year counter (`.dg__c` digits 0–9) that updates automatically as each chapter enters viewport center.
  - Integrated Verified Certifications & Licenses sub-row.

### 7. Interactive Developer Ability Card
- **Reference Element:** 3D collectible trading card (`#holo`, `#hc`) with foil shine and tap-to-flip interaction.
- **Kiran's Implementation:**
  - Trigger button in the hero and navigation.
  - Front Face: Kiran's avatar, student badge, verified competencies, holographic rainbow foil, and mouse/touch 3D tilt.
  - Back Face: Developer identity, GitHub stats, coding profiles, credentials, and social links.
  - Tap or click to flip 180° with CSS 3D preserve-3d transform.

### 8. 5-Step Guided Questionnaire & Contact Experience
- **Reference Element:** 5-step modal questionnaire (`#modal`, `#reqForm`).
- **Kiran's Implementation:**
  - Step 1: Opportunity / Project Scope (Full-Time, Internship, Contract, Open-Source).
  - Step 2: Timeline / Target Start Date.
  - Step 3: Technology Focus & Requirements.
  - Step 4: Organization Type (Startup, Enterprise, Academic, Personal).
  - Step 5: Contact Information (Name, Email, Message).
  - Seamlessly piped into `/api/contact` with Cloudflare Turnstile token verification and Supabase `contact_messages` database insertion.
  - Immediate state feedback: progress bar, error handling, and confirmation screen.

### 9. Certifications, Developer Profiles & Architectural Footer
- **Reference Element:** Scaled typography wordmark (`--wf`), dynamic background color blending, and circular SVG progress totop.
- **Kiran's Implementation:**
  - Competitive programming & open-source profile badges (LeetCode, CodeChef, Codeforces, GitHub).
  - Verified certifications cards with issuer details and credential links.
  - Giant "KIRAN SINHA" wordmark auto-sized to viewport width.
  - Back-to-top floating button with SVG circular scroll progress ring.
  - Discreet `/admin/login` link.

---

## 3. Order of Execution (Work Stages)

- **Phase (a): Projects doors + 3D monitor overview panel** *(Current Stage)*
  - Dynamic doors generated from Supabase projects (3 to 6 doors).
  - Hover crack-open spring physics, custom cursor follower, swing-open on click.
  - Project Overview Panel with 3D monitor mockup, real screenshot, description, individual tech tags, live & repo links, close button, ESC key, focus trapping, and mobile tap support.
  - "View all projects" link to `/projects`.
- **Phase (b): Skills section**
  - Category tabs/list + animated reveal driven dynamically by Supabase skill categories.
- **Phase (c): Journey / Education**
  - 3D clock tunnel canvas and rolling odometer year counter.
- **Phase (d): Developer card**
  - 3D holographic ability card modal with tilt and 180° flip.
- **Phase (e): Contact questionnaire**
  - 5-step interactive questionnaire modal with Turnstile and Supabase integration.
- **Phase (f): Certifications + Profiles**
  - Verified licenses and competitive coding profile showcases.
- **Phase (g): Final Polish**
  - Global performance, transitions, reduced-motion audits, responsive tuning.
