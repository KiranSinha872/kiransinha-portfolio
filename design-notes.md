# Design Notes & Visual Language Guide

This document captures the visual language, design direction, and aesthetic philosophy inspired by modern developer-centric web products (such as [kaizen-mirai.vercel.app](https://kaizen-mirai.vercel.app/)). It serves as a stylistic compass to ensure the portfolio maintains a coherent, premium, and refined dark-mode aesthetic.

---

## 1. Aesthetic Mood & Core Philosophy

* **Atmosphere**: Technical, immersive, and refined. The interface feels like an engineered digital terminal or command center rather than a generic template.
* **Exclusivity**: **Dark Theme Only** — deep, focused, and distraction-free with zero light-mode toggle.
* **Balance**: High contrast between readable text and muted dark backgrounds, with intentional pops of glowing accent color to guide the eye toward primary actions and focal points.

---

## 2. Color Palette & Atmospheric Lighting

### Background Foundation
* **Primary Canvas**: Deep obsidian / void black foundation (`#090d16` to `#060911`) that provides infinite depth.
* **Card & Elevated Surfaces**: Translucent dark slate layers (`rgba(15, 23, 42, 0.65)` to `rgba(15, 23, 42, 0.85)`) paired with modern CSS `backdrop-filter: blur()`.

### Accent Lighting & Gradients
* **Primary Glow**: Vibrant Teal / Cyan / Electric Indigo hues used for ambient background orbs, hover halos, and active states.
* **Secondary Accents**: Subtle Violet, Emerald (for live status indicators), and Rose (for destructive/warning actions).
* **Atmospheric Glows**: Soft, heavily blurred radial gradient light sources placed behind key areas (Hero section, modal centers) that give depth without obstructing legibility.

### Surface Borders & Dividers
* **Default Borders**: Ultra-thin, semi-transparent white borders (`border-white/5` to `border-white/10`) to provide clean structural separation without visual noise.
* **Interactive Borders**: Smooth transition on hover to glowing accent borders (`hover:border-indigo-500/40` or `hover:border-teal-500/40`).

---

## 3. Typography Hierarchy & Font Pairing

The visual identity relies on a deliberate contrast between a **clean geometric sans-serif** and **technical monospace accents**:

| Role | Font Style Feel | Usage / Context |
| :--- | :--- | :--- |
| **Headings (`H1`, `H2`, `H3`)** | Bold, tight-tracking Geometric Sans (`Inter` style) | Hero headline, section titles, project names |
| **Body & Longform** | Clean, highly legible Sans with generous line height | Biographies, project descriptions, education details |
| **Technical Labels & Metadata** | Crisp Monospace (`Roboto Mono` style) | Section category tags, terminal prefixes (`>_`, `./path`), date ranges, status badges |
| **Eyebrow Tags** | Uppercase, tracked-out Monospace/Sans | Small section indicators (e.g. `// SELECTED WORKS`, `> EXPERTISE`) |

---

## 4. Spacing, Rhythm & Layout Composition

* **Macro Spacing**: Generous vertical breathing room between sections (`py-20` to `py-32`) to prevent visual crowding.
* **Container Bounds**: Centered, balanced max-width containers (`max-w-5xl` for content readability, `max-w-7xl` for wide grids).
* **Consistent Grid Structure**:
  * 3-column / 2-column responsive card grids for projects and skills.
  * Uniform gap spacing (`gap-5` to `gap-6`).
* **Section Header Pattern**:
  1. Small uppercase accent eyebrow badge (`> expertise`).
  2. Bold, high-contrast title (`Technical Skills`).
  3. Short, muted explanatory subtitle.

---

## 5. Component Styling Approaches

### A. Buttons & Call-to-Actions
* **Primary CTA**:
  * Solid filled accent background with smooth rounded corners (`rounded-xl` or pill).
  * Subtle colored drop-shadow glow matching the accent color (`shadow-lg shadow-indigo-600/25`).
  * Micro-interaction: Smooth hover brightness shift and subtle icon translation (e.g. arrow slide).
* **Secondary / Ghost Actions**:
  * Translucent glassmorphic pill (`bg-white/5` with `border border-white/10`).
  * Hover state: Elevates to `bg-white/10` with highlighted border.

### B. Cards & Showcase Containers
* **Surface**: Semi-transparent dark slate backdrop with glassmorphism blur (`backdrop-blur-xl`).
* **Border Treatment**: Hairline subtle borders (`border-white/5`) that gently light up upon hover.
* **Image Framing**: Widescreen (`16:9`) containers with clean dark backdrops (`bg-slate-950`) and `object-contain` / `object-cover` fitting to showcase project screenshots without awkward cutoffs.
* **Hover State**: Gentle lift, subtle scale on thumbnails (`group-hover:scale-105`), and border glow transition.

### C. Modals & Overlays
* **Backdrop**: Deep black scrim with high blur (`bg-black/80 backdrop-blur-md`).
* **Modal Dialog**: Floating rounded glass card (`rounded-3xl`) with crisp boundary highlights and prominent close/action buttons.

### D. Badges & Tags
* **Pills**: Compact rounded capsules (`rounded-lg` or `rounded-full`) with semi-transparent tinted backgrounds (e.g. `bg-indigo-600/20 text-indigo-300 border border-indigo-500/30`).
* **Live Status Dots**: Small pulsing emerald green dot (`bg-emerald-400 animate-pulse`) indicating active availability.

---

## 6. Motion & Animation Principles

* **Restraint Over Excess**: Motion should feel purposeful, snappy, and smooth (transitions between `150ms` and `300ms` with ease-out curves).
* **Micro-Interactions**:
  * Arrow translations on hover (`group-hover:translate-x-1`).
  * Smooth modal zoom-in fade (`animate-fadeIn` / `zoom-in-95`).
  * Subtle card elevation on hover.
* **Avoid**: Overly bouncy or aggressive animations that distract from content legibility.

---

## 7. Summary Checklist for Future Sections

- [x] Dark theme only (pure deep dark foundations `#090d16`).
- [x] Hairline translucent borders (`border-white/5` to `border-white/10`).
- [x] High-contrast typography pairing (Geometric Sans + Technical Mono accents).
- [x] Ambient accent lighting and subtle shadow glows.
- [x] Glassmorphism surfaces with backdrop filters.
- [x] Smooth, restrained micro-interactions.
