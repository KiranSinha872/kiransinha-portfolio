# Reference Specification: Architectural Doors (`#works`)

This document records the exact DOM architecture, materials, color tokens, dimensions, spring physics, and interaction parameters from the reference site (`https://therishithakor.com/#works`), audited directly via Chrome DevTools and live computed styles.

---

## 1. Wall & Layout Container

- **Outer Section (`.doors`):**
  - `position: relative; z-index: 1; overflow: hidden;`
  - `margin-top: -2rem; padding-top: calc(2rem + 5.25rem);`
  - Background:
    ```css
    linear-gradient(180deg, rgba(0,0,0,.05) 0%, transparent 22%, transparent 78%, rgba(0,0,0,.07) 100%),
    linear-gradient(180deg, var(--wall-hi) 0%, var(--wall) 55%)
    ```
  - Architectural Wall Texture (`.doors__tex`): WebP background pattern overlay (`opacity: 0.25`).
  - Paint Headline (`.paint`):
    - Text: *"Magic happens behind the doors"*
    - Font: `'Onest', 700`, line-height `0.95`, letter-spacing `-0.03em`, font-size `2.6rem` (mobile) to `4.75rem` (desktop).
- **Row Container (`.doors__row`):**
  - Layout: `display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: end;`
  - Gap: `--gap: 1.5rem` (tablet) to `3rem` (desktop).
  - Skirting / Floor Baseboard (`.doors__row::after`):
    - `height: 1.5rem;`
    - Linear gradient with dual bevel lines and baseboard shadow (`box-shadow: 0 -1px 0 rgba(0,0,0,.07), 0 -.5rem .9rem -.45rem rgba(0,0,0,.16)`).
- **Perspective Floor (`.doors__floor`):**
  - `height: 6.5rem; perspective: 22rem; perspective-origin: 50% 0;`
  - Slanted wooden planks with `transform: rotateX(72deg)`.

---

## 2. Doorway & Frame (The Archway)

- **Unit (`.unit`):**
  - `container-type: inline-size; width: 100%;`
  - Max width: `min(17.5rem, calc((100svh - 19.5rem) / 2.25))` (approx. `280px`).
  - Light ambient cone overhead (`.unit::before`): Radial gradient lamp cone cast onto the wall.
- **Doorway (`.doorway`):**
  - Aspect Ratio: `1 / 2.25` (`width: ~173px`, `height: ~390px` at standard desktop grid).
  - Shape: True Roman Arch (`border-radius: 50cqi 50cqi 0 0`).
  - Outline on keyboard focus: `2px solid var(--accent); outline-offset: 6px`.
- **Arch Casing / Molding (`.casing`):**
  - Outer border radius: `50cqi 50cqi 0 0`.
  - Gradient: Subtle architectural bevel highlighting left-to-right (`linear-gradient(90deg, rgba(0,0,0,.07), rgba(255,255,255,.18) 3cqi, transparent 6cqi, ...)`).
  - Inset Shadows: Multi-tiered molding depths:
    `inset 0 0 0 1.1cqi rgba(255,255,255,.28), inset 0 0 0 1.5cqi rgba(0,0,0,.07), inset 0 0 0 3.6cqi rgba(255,255,255,.12), inset 0 0 0 4.1cqi rgba(0,0,0,.08)`.
  - Drop Shadows: `1.5cqi 2.5cqi 4.5cqi rgba(26,24,24,.2)`.
  - Plinth Block (`.casing::before`): Bottom base block height `11cqi`.

---

## 3. Opening & 3D Door Leaf

- **Opening Frame (`.opening`):**
  - Inset: `left: 7.5cqi; right: 7.5cqi; top: 7.5cqi; bottom: 0;`
  - 3D Perspective: `perspective: 160cqi; perspective-origin: 50% 42%;`
- **Door Panel (`.door`):**
  - Shape: Arched top (`border-radius: 42.5cqi 42.5cqi 0 0`).
  - Transform Origin: `left center` (`0px 188.242px`).
  - Materials & Tone:
    - Door 01: Slate Midnight (`--door: #22304a; --door-dk: #1c2840`)
    - Door 02: Wine Plum (`--door: #4a3540; --door-dk: #3f2d37`)
    - Door 03: Olive Sage (`--door: #7a8670; --door-dk: #66705d`)
    - Door 04: Burnt Ochre (`--door: #a4552c; --door-dk: #874422`)
  - Lighting Gradient: `linear-gradient(100deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.18) 100%)`.
  - Fluted Paneling (`.door__flute`):
    - Recessed arched molding: `left: 4.8cqi; right: 4.8cqi; top: 8cqi; bottom: 9cqi; border-radius: 34.5cqi 34.5cqi 1.2cqi 1.2cqi`.
    - Vertical micro-fluting lines: `repeating-linear-gradient(90deg, rgba(255,255,255,.075) 0, rgba(255,255,255,.02) 1cqi, rgba(0,0,0,.13) 2.1cqi, rgba(255,255,255,.075) 2.8cqi)`.
  - Nameplate (`.plate`):
    - Position: `left: 50%; top: 31%; translate: -50% -50%; width: 58cqi; padding: 2.6cqi 4cqi; border-radius: .9cqi;`
    - Material: Embossed Brass `linear-gradient(160deg, #efdfb2 0%, #c9a866 28%, #e3cc92 48%, #a98747 72%, #d2b67a 100%)`.
    - Typography: All-caps, font-size `5.4cqi`, font-weight `600`, letter-spacing `0.09em`, color `#2b2112`, text-shadow for debossed engraving.
    - Screws: Left and right brass screw rivets (`.plate::before`, `.plate::after`).
  - Hardware Handle & Lock (`.handle`):
    - Position: `right: 7cqi; top: 59%; width: 9.4cqi; height: 9.4cqi; border-radius: 50%;`
    - Brass Rosette: Radial gradient with metallic highlight.
    - Lever (`.handle__lever`): Horizontal arched brass lever pointing left (`width: 23cqi; height: 3.9cqi`).
    - Keyhole Escutcheon (`.handle__lock`): Keyhole cylinder beneath handle at `top: calc(100% + 6.5cqi)`.
  - Door Turn Shade (`.door__shade`): `#000` with opacity `calc(var(--o, 0) * 0.5)` deepening as door swings open.

---

## 4. Interior Room & Light Spill

- **Behind the Door (`.room`):**
  - Shape: Matches arch (`border-radius: 42.5cqi 42.5cqi 0 0`).
  - Real Content: Project visual artwork / screenshot preview loaded behind the doorway, bathed in deep ambient shadow.
- **Threshold Sill (`.sill`):**
  - Position: `left: 3cqi; right: 3cqi; bottom: 0; height: 1cqi; filter: blur(0.7cqi);`
  - Shines with warm light (`opacity: 0.4` at rest, `0.75` on hover, `1.0` on swing-open).
- **Floor Spill Pool (`.pool`):**
  - Casts an ellipse of light on the wooden floor directly in front of the door.

---

## 5. Animation Physics & Cursor Follower

- **Physics Engine:**
  - Spring: `{ tension: 120, friction: 14 }`.
  - Rest State: `o = 0` -> `rotateY(0deg)`.
  - Hover Crack-Open: `o = 0.1` -> `rotateY(7deg)` to `rotateY(10deg)` inward swing.
  - Click Swing-Open: `o = 1.0` -> `rotateY(70deg)` fully swung open.
  - Duration: Spring damping (~450ms settle).
- **Cursor Follower Badge (`#doorCursor`):**
  - Follows pointer coordinates without travel lag: `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`.
  - Circular dark badge with white label or arrow, fades in only when mouse is within doorway boundaries.
  - Hidden on touch devices (`@media (pointer: coarse)` or `hover: none`).

---

## 6. Project Integration Guidelines for Kiran Sinha Portfolio

1. **Doors = Projects:** Each door represents one of Kiran's projects (3 to 6 doors).
2. **Title on Plate:** Clean project title in uppercase brass typography on `.plate`.
3. **Real Content Behind Door:** Inside `.room`, the real project screenshot / graphic preview sits illuminated, so cracking or opening the door reveals authentic project work.
4. **Swing Open:** Clicking a door swings it wide (`rotateY(70deg)`) and transitions smoothly into the Project Overview Modal.
