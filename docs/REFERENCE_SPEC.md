# Reference Site Specification — therishithakor.com

> **Reference URL:** `https://therishithakor.com/`  
> **Redesign Target:** Recreate the aesthetic, typography, animations, physics, and interactive experiences in Next.js (App Router) + Tailwind CSS + Framer Motion + Lenis for Kiran Sinha's portfolio.

---

## 1. Design System & Tokens

### Typography
- **Primary Body & Display Font:** `'Onest', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`
  - Weights: 100 to 900 (Variable)
  - Display Headings: `font-weight: 600`, `letter-spacing: -0.025em`, `line-height: 0.95`
  - Fluid Heading Scale: `font-size: clamp(44px, 7vw, 84px)` and `clamp(34px, 8.2vw, 104px)`
- **Monospace & Numerals:** `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`
  - Numeric figures use `font-variant-numeric: tabular-nums` (`.tnum`) for synchronized timers and counters.
- **Eyebrows & Labels:** Uppercase, `letter-spacing: 0.12em` to `0.2em`, `font-size: 11px - 13px`, `font-weight: 600`.

### Adaptive REM Grid
The layout scales with viewport width to preserve exact visual proportions across screen sizes:
- `width < 640px`: `html { font-size: 4.444444vw; }`
- `width < 1024px`: `html { font-size: 1.5625vw; }`
- `width < 1440px`: `html { font-size: 1.111111vw; }`
- `width < 1920px`: `html { font-size: 0.833333vw; }`
- `base`: `16px`

### Container & Layout
- **Container Max-Width (`.shell`):** `88rem` (`1408px`), centered with `margin-inline: auto`.
- **Gutters:**
  - Desktop (`>= 1024px`): `--gut-lg: 5.5rem` (88px)
  - Tablet (`>= 640px`): `padding-inline: 2rem` (32px)
  - Mobile: `padding-inline: 1.25rem` (20px)

### Color Palette (Dual-Theme Tokens)

| Token | Light Mode | Dark Mode (`html[data-mode="dark"]`) | Description |
| :--- | :--- | :--- | :--- |
| `--background` | `#E8E4E0` | `#1A1818` | Warm parchment in light; deep matte charcoal in dark |
| `--foreground` / `--ink` | `#1A1818` | `#E8E4E0` | High-contrast body text and headers |
| `--surface` | `#DED8D4` | `#252121` | Base card and container surface |
| `--surface-2` | `#D3CBC8` | `#302A2A` | Elevated secondary surface |
| `--line` | `#D5CDCA` | `rgba(196,176,176,0.16)` | Subtle dividing borders and hairlines |
| `--muted` | `#857878` | `#857878` | Secondary labels and timestamp text |
| `--accent` | `#6B5C5C` | `#D9C6C6` | Contrast highlights and focus outlines |
| `--btn-bg` | `#1A1818` | `#E8E4E0` | Primary action button fill |
| `--btn-fg` | `#E8E4E0` | `#1A1818` | Primary action button text |
| `--panel` | `#F0ECE9` | `#221F1F` | Modal overlays and drawer panels |

### Animation Easing Curves
- **Line Mask Reveal:** `cubic-bezier(.215, .61, .355, 1)` (duration `0.9s`)
- **Spring Elements (Doors & Modals):** `cubic-bezier(.22, 1, .36, 1)`
- **Smooth Surface / Monitor 3D Tilt:** `cubic-bezier(.16, 1, .3, 1)` (duration `1.0s - 1.2s`)
- **Cord Snapping & Button Pops:** `cubic-bezier(.2, .8, .2, 1)`
- **View Transitions Crossfade:** `cubic-bezier(.4, 0, .2, 1)` (duration `0.5s`)

---

## 2. Interactive Components Specification

### A. Intro Staggered Loader (`#loader`)
- **Visuals:** Full-viewport dark radial gradient backdrop (`#0D0C0C`).
- **Stack Animation:** A stack of 6 rounded colored pill chips representing developer disciplines (e.g., *Kiran Sinha*, *Full-Stack Engineering*, *Data Structures & Algorithms*, *AI & Machine Learning*, *Cloud Architecture*, *System Design*).
- **Movement:** Pills slide in alternately from left (`--dir: -1`) and right (`--dir: 1`) with staggered timing.
- **Counter:** Mechanical tabular counter ticking smoothly from `000` to `100` alongside an animated progress bar.
- **Exit Sequence:** Upon reaching 100%, the curtain transforms upward (`transform: translateY(-100%)`, `duration: 0.85s`, `cubic-bezier(.76, 0, .24, 1)`), adding `body.ready` and animating the hero's text line masks.

### B. Verlet Physics Pull-Cord Dark Mode Switch (`#cord`, `#cordHit`)
- **Mechanism:** Interactive ceiling pull cord rendered on an HTML5 `<canvas>`.
- **Physics Model:** 26-segment Verlet integration rope with real gravity ($G = 4600\text{ px/s}^2$), dampening, and 16 constraint relaxation passes per frame.
- **Interactions:**
  - Grab with mouse pointer or touch.
  - Natural pendulum swinging and momentum when pulled or released.
  - When pulled downward past travel threshold (`EXT_MAX`), the switch trips with a tactile snap, toggling light and dark mode.
- **Theme Transition:** Native View Transitions API (`document.startViewTransition`) for a GPU-accelerated whole-page crossfade.

### C. Hero Section & Availability Status
- **Layout:** Split layout with large fluid stacked typography on the left and cut-out portrait on the right.
- **Live Status:** Flip-calendar / live status badge indicating availability (e.g. "Available for Opportunities / Fall 2026").
- **Live Local Clock:** Dynamic digital clock showing the current time formatted to the visitor's local or developer timezone.
- **Interactive Trigger:** Floating badge prompting the user to inspect the **Developer Ability Card**.

### D. Holographic 3D Developer Ability Card (`#holo`, `#hc`)
- **Modal Container:** Full-screen backdrop dialog.
- **Card Design:** High-fidelity 3D collectible trading card with physical thickness, bevels, and border rim.
- **Front Face:**
  - Developer photo/avatar frame
  - Developer stats:
    - *Full-Stack / Backend Engineering:* 90
    - *Data Structures & Algorithms:* 92
    - *Cloud & Distributed Systems:* 88
    - *Artificial Intelligence & ML:* 85
  - Dynamic holographic rainbow foil layer, glare highlight, and light reflection sheen.
- **Back Face:**
  - Developer Identity, GitHub stats, LeetCode rank, verified student credentials, and QR code / socials.
- **Interaction:**
  - Responsive mouse move / mobile gyroscope 3D tilt (`rotateX`, `rotateY`, `perspective: 1200px`).
  - Tap or click to flip 180° (`transform: rotateY(180deg)`).

### E. The Interactive Skill Doors (`#works`)
- **Structure:** A textured architectural wall featuring 3D doors corresponding to core skill domains:
  1. *Full-Stack & Backend Systems* (`--door: #22304a`)
  2. *Algorithms & Competitive Programming* (`--door: #4a3540`)
  3. *AI & Machine Learning Engineering* (`--door: #7a8670`)
  4. *Cloud Infrastructure & DevOps* (`--door: #a4552c`)
- **Hover Physics:** Approaching or hovering a door initiates a spring physics reaction (`tension: 120, friction: 14`), slightly cracking the door open (`rotateY(10deg)`).
- **Custom Cursor:** Floating circular badge (`#doorCursor`) locking onto the mouse pointer when hovering the doorways.
- **Dynamic Skill Info Display (`#dinfo`):** Hovering any door dynamically positions a floating description card in the adjacent wall space, detailing the core competencies and technologies inside that domain.
- **Door Opening:** Clicking a door swings it wide open (`rotateY(70deg)`), animating interior warm light illumination onto the floor sill, then smoothly carrying the camera through `#passage` into the project showcase room.

### F. Stacked 3D Monitor Project Showcase
- **Layout:** Stacked sticky cards (`position: sticky; top: calc(...)`) that layer over one another on scroll.
- **Interactive 3D Device:** Each card features a 3D desktop monitor mockup:
  - Turned at a dramatic 3D angle: `perspective: 1900px`, `transform: rotateY(-17deg) rotateX(4deg)`.
  - Realistic extruded monitor bezel thickness, monitor neck, stand base, and ambient drop shadow.
  - Hovering the card dynamically reduces the tilt angle (`rotateY(-12deg) rotateX(3deg)`).
  - Alternating cards ("flip") reverse the angle to `rotateY(17deg)` for rhythmic layout variety.
- **Card Information:**
  - Project Title & Category
  - Individualized Tech Stack Tags
  - Descriptive paragraph
  - Outbound "Live Demo" and "GitHub Repo" pill buttons

### G. Time-Travel Story Journey (`#about`)
- **Layout:** 5-milestone academic and development timeline.
- **3D Clock Tunnel Canvas:** Canvas background rendering 16 depth-receding 3D rotating rings with focal perspective, winding backwards through time as the user scrolls.
- **Mechanical Odometer Year Counter:** 4-digit roller (`.dg__c` digits 0–9) that mechanically spins to the year of each respective milestone as it enters the viewport.
- **Vertical Progress Rail:** Glowing traveling dot (`.story__dot`) with a light trail tracing the vertical journey line.
- **Chapter Meter:** Compact HUD indicating progress (e.g. `01 / 05`).

### H. 5-Step Guided Questionnaire & Contact Modal (`#modal`, `#reqForm`)
- **Architecture:** Modal questionnaire replacing standard static contact forms with an engaging 5-step interactive flow:
  - **Step 1:** Inquiries / Opportunity Type (*Full-Time Engineering*, *Internship / Co-op*, *Contract / Freelance*, *Open-Source Collaboration*)
  - **Step 2:** Timeline / Target Start Date
  - **Step 3:** Project / Team Scope & Focus Area
  - **Step 4:** Organization / Team Type (*Tech Company*, *Startup*, *Academic / Research*, *Individual*)
  - **Step 5:** Contact Information (*Name, Email, Message*)
- **Verification & Delivery:**
  - Automated Cloudflare Turnstile CAPTCHA verification
  - Submission to Supabase `contact_messages` table via Next.js `/api/contact` API route
  - Animated progress indicator (`1 of 5` to `5 of 5`) and celebratory completion screen

### I. Architectural Footer & Back-to-Top
- **Dynamic Brand Wordmark:** Full-bleed name ("KIRAN SINHA") dynamically scaled with JavaScript font-fitting (`--wf`) to span the full viewport width.
- **Section Color Blending:** Footer top corners dynamically sample the background color of the preceding section for seamless visual continuity.
- **Smart Back-to-Top:** Floating circular button with circular SVG scroll progress fill that automatically flips contrast when hovering over dark or light sections.
- **Admin Access:** Subtle, discreet admin portal link for portfolio owners.

---

## 3. Libraries & Dependencies Strategy

| Feature | Reference Site Implementation | Next.js Redesign Implementation |
| :--- | :--- | :--- |
| **Framework** | Vanilla HTML + JS Modules | Next.js 16.3.4 (App Router) + React 19 |
| **Smooth Scroll** | Lenis (`./vendor/lenis.min.mjs`) | `@studio-freight/lenis` / `lenis/react` |
| **Animation Engine** | Vanilla rAF + Spring helper | Framer Motion `^13.2.0` + CSS 3D |
| **Physics Canvas** | Verlet integration on `<canvas>` | React `<canvas>` component with requestAnimationFrame |
| **Theme Switching** | View Transitions API (`::view-transition`) | React Theme Provider + View Transitions API |
| **Data Backend** | Netlify Forms | Supabase PostgreSQL (`contact_messages`) + Turnstile |
| **CMS / Admin** | Static HTML files | Supabase Auth + Next.js Server Actions + `/admin` Dashboard |
