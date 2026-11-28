# Portrait Semantic Mask Segmentation

## 1. Overview & Methodology
The per-part interactive portrait highlighting system uses offline semantic human parsing masks generated from Kiran's high-resolution cut-out photo (`public/images/my-photo.png`, 515 × 1024 px).

Instead of approximate manual vector paths, the masks were generated using **Self-Correction Human Parsing (SCHP)** trained on the **Look Into Person (LIP)** dataset, executed through an optimized ONNX Runtime pipeline (`parsing_lip.onnx`).

### Segmentation Pipeline
1. **Pre-processing:**
   - Aspect ratio preservation: the 515 × 1024 cut-out was letterboxed onto a square 1024 × 1024 canvas with black padding, then bilinearly scaled to the model input dimensions (473 × 473 px).
   - Standard ImageNet channel normalization ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).

2. **Inference & Semantic Categorization:**
   - 20-channel semantic logit prediction upsampled with spline interpolation back to the original 1024 × 1024 square space and cropped back to 515 × 1024 px.
   - Part assignment:
     - **Hair (`hair`):** LIP Class 2 (`Hair`).
     - **Face & Skin (`face_skin`):** LIP Class 13 (`Face`), arms/hands (Classes 14 & 15), and neck skin clusters.
     - **Shirt (`shirt`):** High-luminance, low-saturation region within UpperClothes (Class 5).
     - **Tie (`tie`):** Central dark necktie band within UpperClothes (Class 5).
     - **Jacket (`jacket`):** LIP Class 7 (`Coat / Blazer`) plus lapels.
     - **Trousers (`trousers`):** LIP Class 9 (`Pants / Trousers`).

3. **Anti-Aliasing & Edge Feathering:**
   - Each binary mask was filtered with a gentle Gaussian blur ($\sigma = 1.0$) to produce smooth, organic transitions.
   - All masks were hard-clamped to the original cut-out's alpha channel (`alpha > 20`), guaranteeing that zero color spill or halos ever appear outside the portrait silhouette.

---

## 2. Generated Assets Directory

### Mask Assets (`public/images/portrait-parts/masks/`)
- `hair_mask.png` — 8-bit grayscale mask for hair.
- `face_skin_mask.png` — 8-bit grayscale mask for face, neck, and skin.
- `shirt_mask.png` — 8-bit grayscale mask for shirt.
- `tie_mask.png` — 8-bit grayscale mask for tie.
- `jacket_mask.png` — 8-bit grayscale mask for jacket/blazer.
- `trousers_mask.png` — 8-bit grayscale mask for trousers.

### Color Part Layers (`public/images/portrait-parts/`)
- `hair.png` — 32-bit RGBA cut-out of hair in full color with feathered transparency.
- `face_skin.png` — 32-bit RGBA cut-out of face and skin.
- `shirt.png` — 32-bit RGBA cut-out of shirt.
- `tie.png` — 32-bit RGBA cut-out of tie.
- `jacket.png` — 32-bit RGBA cut-out of jacket.
- `trousers.png` — 32-bit RGBA cut-out of trousers.

### Client-Side Hit-Test Map (`public/images/portrait-parts/hitmap.png`)
An 8-bit index map where each pixel value directly encodes the target part ID:
- `0`: Background / empty space (clicking does nothing)
- `1`: Hair
- `2`: Face and Skin
- `3`: Shirt
- `4`: Tie
- `5`: Jacket
- `6`: Trousers

Enables instant $O(1)$ cursor hit-testing and tap detection on touch devices without canvas re-rendering.
