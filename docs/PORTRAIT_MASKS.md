# Portrait Interactive Colour Spotlight Trail

## 1. Overview & Architecture
The hero portrait interaction matches the reference site (therishithakor.com): a soft, feathered **colour spotlight brush** with a dynamic fading trail that reveals the true-colour portrait over a greyscale base image.

### Two-Layer Architecture
1. **Base Layer:** Grayscale cut-out portrait (`/images/my-photo.png`) rendered with `filter: grayscale(100%) contrast(103%)`.
2. **Top Colour Layer (Canvas Trail Mask):**
   - High-DPI canvas sized dynamically to `devicePixelRatio`.
   - An off-screen canvas maintains an alpha trail mask.
   - On `pointermove` / `pointerdown` (mouse, touch drag, tap): radial gradient stamps with smooth falloff (radius 85–125px) are painted onto the mask. Intermediate points are linearly interpolated between movements, ensuring rapid cursor swipes produce unbroken, fluid streaks rather than disjoint dots.
   - On each animation frame (`requestAnimationFrame`):
     - The trail mask is gently faded using exponential decay $(\tau \approx 1.6\text{s})$, allowing multiple fading trails to remain visible simultaneously before decaying smoothly back to grey.
     - The true-colour cut-out photo is drawn onto the visible canvas.
     - The colour photo is composited through the mask using `globalCompositeOperation = 'destination-in'`, clipping the reveal strictly to both the brush trail and the portrait's transparent silhouette. Zero color can ever bleed outside the silhouette.
     - Once the mask has completely decayed (> 2.0s without pointer input) or when the portrait scrolls out of the viewport (via `IntersectionObserver`), the animation loop stops to conserve CPU and battery.

---

## 2. Interaction Details
- **Cursor:** Changes to `cursor-pointer` (small hand) while hovering over the portrait.
- **Touch Devices:** Touch drags paint the spotlight trail continuously; a single tap paints a single soft spotlight.
- **Accessibility & Reduced Motion:**
  - With `prefers-reduced-motion: reduce`, the dynamic canvas loop is omitted in favour of a soft, static centred radial gradient reveal that fades in on keyboard focus (`tabIndex={0}`).
  - Accessible `role="region"` and descriptive `aria-label`.
  - The floating "My developer card" pill button remains floating at the chest level with uninterrupted click handling.
