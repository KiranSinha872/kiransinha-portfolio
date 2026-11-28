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

### 4. Technical Skill Doors Wall
- **Reference Element:** The 4 architectural skill doors (`#works`, `#dinfo`) with spring physics and walk-through zoom.
- **Kiran's Implementation:**
  - 4 specialized developer domains:
    1. *Full-Stack & Backend Systems* (`#22304a`)
    2. *Algorithms & Competitive Programming* (`#4a3540`)
    3. *AI & Machine Learning Engineering* (`#7a8670`)
    4. *Cloud Infrastructure & DevOps* (`#a4552c`)
  - Spring-loaded hover interaction cracking the door open (`rotateY(10deg)`), accompanied by a custom cursor follower (`#doorCursor`).
  - Floating info card (`#dinfo`) dynamically rendering technical competencies queried from Supabase (`public.skills`).
  - Clicking a door swings it wide (`rotateY(70deg)`) and transitions seamlessly to the project showcase.

### 5. Stacked 3D Monitor Projects Showcase
- **Reference Element:** Sticky stacked project cards with 3D tilted desktop monitor mockups.
- **Kiran's Implementation:**
  - Top 3 featured projects rendered on sticky cards that stack progressively during scroll.
  - Each card contains an extruded 3D desktop monitor mockup turned at `rotateY(-17deg)` with realistic bezel, neck, base, and screen glare overlay.
  - Interactive mouse hover dynamically eases the monitor angle to `rotateY(-12deg)`.
  - Alternating cards ("flip") reverse the angle to `rotateY(17deg)` for visual balance.
  - Individual tech stack tags, descriptive overview, live demo link, and GitHub repository link on every card.
  - "View All Projects →" link redirecting to the dedicated `/projects` archive page.

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

### 7. 5-Step Guided Questionnaire & Contact Experience
- **Reference Element:** 5-step modal questionnaire (`#modal`, `#reqForm`).
- **Kiran's Implementation:**
  - Step 1: Opportunity / Project Scope (Full-Time, Internship, Contract, Open-Source).
  - Step 2: Timeline / Target Start Date.
  - Step 3: Technology Focus & Requirements.
  - Step 4: Organization Type (Startup, Enterprise, Academic, Personal).
  - Step 5: Contact Information (Name, Email, Message).
  - Seamlessly piped into `/api/contact` with Cloudflare Turnstile token verification and Supabase `contact_messages` database insertion.
  - Immediate state feedback: progress bar, error handling, and confirmation screen.

### 8. Architectural Footer & Back-to-Top
- **Reference Element:** Scaled typography wordmark (`--wf`), dynamic background color blending, and circular SVG progress totop.
- **Kiran's Implementation:**
  - Giant "KIRAN SINHA" wordmark auto-sized to viewport width.
  - Back-to-top floating button with SVG circular scroll progress ring and luminance-based contrast switching.
  - Social icons (GitHub, LinkedIn, Email) and discreet `/admin/login` link.

---

## 3. Order of Execution (Work Stages)

1. **Stage 1: Theme & Typography Foundations**
   - Install Lenis smooth scroll (`@studio-freight/lenis` or `lenis/react`).
   - Configure `'Onest'` font variable and adaptive REM scaling in `src/app/globals.css` and `src/app/layout.tsx`.
   - Setup dual-theme CSS variables and View Transitions helper.

2. **Stage 2: Header, Overlay Menu & Verlet Pull Cord**
   - Build `PullCord` component with canvas Verlet integration.
   - Build responsive `Header` with live clock, year, brand logo, and overlay navigation.

3. **Stage 3: Staggered Intro Loader & Hero**
   - Build `IntroLoader` with 6 sliding discipline pills and percentage counter.
   - Redesign `Hero` with fluid typography, live status badge, and resume viewer modal.

4. **Stage 4: Holographic 3D Developer Ability Card**
   - Build `AbilityCardModal` with front/back 3D tilt, gyroscope support, and flip mechanics.

5. **Stage 5: Skill Doors Wall**
   - Build `SkillDoors` component with spring physics hover, custom cursor follower, and floating description card connected to Supabase data.

6. **Stage 6: Stacked 3D Monitor Projects Showcase**
   - Build sticky stacked project cards with 3D monitor mockups and individual tech tags.
   - Adapt standalone `/projects` archive page to match the new visual aesthetic.

7. **Stage 7: Time-Travel Academic Journey**
   - Build `JourneySection` with 3D clock tunnel canvas, traveling dot, and rolling odometer year counter.
   - Integrate verified certifications and credentials.

8. **Stage 8: 5-Step Contact Questionnaire**
   - Build `ContactModal` with multi-step questionnaire, Turnstile integration, and `/api/contact` submission.

9. **Stage 9: Architectural Footer & Verification**
   - Implement auto-scaled wordmark footer and circular progress back-to-top button.
   - Run end-to-end tests (`npm test`), build validation (`npm run build`), and linting (`npm run lint`).
