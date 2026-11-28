#!/usr/bin/env python3
"""
Rebuild portrait segmentation as a strict Partition of Unity across 7 parts:
1. hair
2. face (including forehead, glasses, eyes, nose, cheeks, mouth, jaw, ears, and neck)
3. hands (pocket hand and side hand)
4. shirt (collar, front placket, cuffs)
5. tie (knot and blade)
6. jacket (suit blazer, lapels, sleeves, torso)
7. trousers (pants from waist to bottom)

Enforces:
- Every opaque pixel (alpha > 15) belongs to EXACTLY one part in the hitmap.
- Partition of unity: sum(mask weights) == cutout alpha at every pixel.
- 0 uncovered pixels, 0 overlap, 0 spill outside cutout.
- Disconnected island pruning.
"""

import os
import sys
import numpy as np
from PIL import Image
import onnxruntime as ort
import scipy.ndimage

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    photo_path = os.path.join(base_dir, 'public', 'images', 'my-photo.png')
    out_dir = os.path.join(base_dir, 'public', 'images', 'portrait-parts')
    masks_dir = os.path.join(out_dir, 'masks')
    os.makedirs(masks_dir, exist_ok=True)

    img = Image.open(photo_path)
    rgba = np.array(img)
    alpha = rgba[:, :, 3]
    rgb = rgba[:, :, :3]
    r = rgb[:, :, 0].astype(int)
    g = rgb[:, :, 1].astype(int)
    b = rgb[:, :, 2].astype(int)
    H, W = alpha.shape
    opaque = alpha > 15
    total_opaque = int(np.sum(opaque))
    print(f"Loaded {photo_path} ({W}x{H}), total opaque pixels: {total_opaque}")

    # ONNX inference for LIP parsing
    canvas = np.zeros((1024, 1024, 3), dtype=np.uint8)
    canvas[:, :515, :] = rgb
    sq_img = Image.fromarray(canvas).resize((473, 473), Image.Resampling.BILINEAR)
    inp = (np.array(sq_img, dtype=np.float32) / 255.0 - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    inp = inp.astype(np.float32)
    inp = np.transpose(inp, (2, 0, 1))[np.newaxis, :, :, :]

    session = ort.InferenceSession('/tmp/parsing_lip.onnx')
    outs = session.run(None, {'input.1': inp})
    logits = outs[0][0]

    zoom_factors = (1024 / logits.shape[1], 1024 / logits.shape[2])
    logits_up = np.zeros((20, 1024, 1024), dtype=np.float32)
    for c in range(20):
        logits_up[c] = scipy.ndimage.zoom(logits[c], zoom_factors, order=1)[:1024, :1024]
    logits_cropped = logits_up[:, :, :515]

    y_grid, x_grid = np.mgrid[0:H, 0:W]
    head_opaque = opaque & (y_grid < 340)

    # 1. FACE CORE REGION (Forehead, Glasses, Eyes, Nose, Cheeks, Jaw, Ears, Neck)
    ear_region = head_opaque & (y_grid >= 165) & (y_grid <= 255) & (x_grid >= 160) & (x_grid <= 245)
    glasses_region = head_opaque & (y_grid >= 120) & (y_grid <= 205) & (x_grid >= 30) & (x_grid <= 165)
    forehead_region = head_opaque & (y_grid >= 100) & (y_grid <= 145) & (x_grid >= 35) & (x_grid <= 135) & ((r > 60) | (r > g))
    neck_region = head_opaque & (y_grid >= 220) & (y_grid <= 335) & (x_grid >= 130) & (x_grid <= 230)
    lower_face = head_opaque & (y_grid >= 145) & (y_grid <= 265) & (x_grid >= 35) & (x_grid <= 170)
    face_core = ear_region | glasses_region | forehead_region | neck_region | lower_face

    # 2. HAIR
    raw_hair = (logits_cropped[2] > logits_cropped[13]) & (logits_cropped[2] > logits_cropped[7]) & (y_grid < 310)
    hair_clean = raw_hair & (~face_core)
    hair_clean = hair_clean | (head_opaque & (x_grid > 215) & (y_grid < 250) & (r < 50) & (g < 50) & (b < 50))
    hair_clean = hair_clean | (head_opaque & (y_grid < 110) & (~forehead_region))
    hair_clean = hair_clean & (y_grid < 270)
    hair_clean = scipy.ndimage.binary_fill_holes(hair_clean) & head_opaque

    # 3. SHIRT
    is_bright = (r > 120) & (g > 120) & (b > 120) & opaque
    shirt_clean = np.zeros((H, W), dtype=bool)
    shirt_clean |= (y_grid >= 270) & (y_grid <= 370) & (x_grid >= 110) & (x_grid <= 260) & is_bright
    shirt_clean |= (y_grid >= 340) & (y_grid <= 530) & (x_grid >= 120) & (x_grid <= 220) & is_bright
    shirt_clean |= (y_grid >= 740) & (y_grid <= 810) & (x_grid >= 110) & (x_grid <= 145) & is_bright
    shirt_clean = scipy.ndimage.binary_fill_holes(shirt_clean) & opaque & (~hair_clean)

    # Recompute face:
    is_jacket_top = head_opaque & (y_grid >= 260) & (((x_grid > 235) & (y_grid > 260)) | ((x_grid < 130) & (y_grid > 275))) & (~shirt_clean)
    face_clean = head_opaque & (~hair_clean) & (~shirt_clean) & (~is_jacket_top) & (y_grid < 340)
    face_clean = scipy.ndimage.binary_fill_holes(face_clean) & head_opaque & (~hair_clean) & (~shirt_clean)

    # 4. HANDS
    is_skin_lower = (y_grid > 500) & (r > 1.05 * g) & (g > b) & (r > 70) & (b < 180) & opaque
    pocket_hand = is_skin_lower & (y_grid >= 680) & (y_grid <= 850) & (x_grid >= 90) & (x_grid <= 150)
    pocket_hand = scipy.ndimage.binary_dilation(pocket_hand, iterations=2) & opaque & (r > 50)
    right_hand = is_skin_lower & (y_grid >= 950) & (x_grid >= 270)
    right_hand = scipy.ndimage.binary_dilation(right_hand, iterations=2) & opaque & (r > 50)
    hands_clean = (pocket_hand | right_hand) & (~face_clean) & (~shirt_clean)

    # 5. TIE
    tie_old = np.array(Image.open(os.path.join(masks_dir, 'tie_mask.png'))) > 50
    # Central necktie column: knot and blade run down between X in [125, 210], Y in [310, 560]
    tie_cand = tie_old & (y_grid >= 310) & (y_grid <= 560) & (x_grid >= 125) & (x_grid <= 210) & (~shirt_clean) & (~hands_clean) & (~face_clean) & (~hair_clean) & opaque
    # Morphological closing to connect knot and blade
    tie_cand = scipy.ndimage.binary_closing(tie_cand, structure=np.ones((5, 5)))
    # Keep only significant components (> 500 px) to eliminate lapel shadows
    tie_lbl, num_tie = scipy.ndimage.label(tie_cand)
    tie_clean = np.zeros((H, W), dtype=bool)
    for i in range(1, num_tie + 1):
        if np.sum(tie_lbl == i) > 500:
            tie_clean |= (tie_lbl == i)
    tie_clean = scipy.ndimage.binary_fill_holes(tie_clean) & opaque

    # 6. TROUSERS
    trousers_old = np.array(Image.open(os.path.join(masks_dir, 'trousers_mask.png'))) > 50
    trousers_clean = trousers_old & (~hands_clean) & (~shirt_clean) & (~tie_clean) & (~face_clean) & (~hair_clean) & opaque
    trousers_clean = scipy.ndimage.binary_fill_holes(trousers_clean) & opaque

    # 7. JACKET
    jacket_clean = opaque & (~hair_clean) & (~face_clean) & (~hands_clean) & (~shirt_clean) & (~tie_clean) & (~trousers_clean)
    jacket_clean = scipy.ndimage.binary_fill_holes(jacket_clean) & opaque & (~hair_clean) & (~face_clean) & (~hands_clean) & (~shirt_clean) & (~tie_clean) & (~trousers_clean)

    # BUILD STRICT DISCRETE PARTITION
    # Values:
    # 0: bg, 1: hair, 2: face, 3: hands, 4: shirt, 5: tie, 6: jacket, 7: trousers
    label_map = np.zeros((H, W), dtype=np.uint8)
    label_map[jacket_clean] = 6
    label_map[trousers_clean] = 7
    label_map[shirt_clean] = 4
    label_map[tie_clean] = 5
    label_map[hands_clean] = 3
    label_map[hair_clean] = 1
    label_map[face_clean] = 2

    # Resolve any rare boundary unassigned pixels via Voronoi distance transform
    unassigned = opaque & (label_map == 0)
    if np.sum(unassigned) > 0:
        print(f"Resolving {np.sum(unassigned)} unassigned boundary pixels via Euclidean distance transform...")
        _, nearest_idx = scipy.ndimage.distance_transform_edt(label_map == 0, return_indices=True)
        label_map[unassigned] = label_map[nearest_idx[0][unassigned], nearest_idx[1][unassigned]]

    label_map[~opaque] = 0

    # Prune tiny disconnected stray islands (< 25 pixels)
    for part_val in range(1, 8):
        binary_part = (label_map == part_val)
        labeled_cc, num_cc = scipy.ndimage.label(binary_part)
        for cc_id in range(1, num_cc + 1):
            cc_mask = (labeled_cc == cc_id)
            if np.sum(cc_mask) < 25:
                border = scipy.ndimage.binary_dilation(cc_mask) & (~cc_mask) & opaque
                neighbor_vals = label_map[border]
                if len(neighbor_vals) > 0:
                    dominant = int(np.bincount(neighbor_vals).argmax())
                    if dominant > 0:
                        label_map[cc_mask] = dominant

    uncovered = opaque & (label_map == 0)
    assert np.sum(uncovered) == 0, f"Error: {np.sum(uncovered)} opaque pixels left unassigned!"

    PART_DEFS = [
        (1, 'hair', 'Hair'),
        (2, 'face', 'Face & Neck'),
        (3, 'hands', 'Hands'),
        (4, 'shirt', 'Shirt'),
        (5, 'tie', 'Tie'),
        (6, 'jacket', 'Jacket'),
        (7, 'trousers', 'Trousers'),
    ]

    print("\n--- Discrete Partition Pixel Counts ---")
    for val, pid, name in PART_DEFS:
        count = int(np.sum(label_map == val))
        pct = (count / total_opaque) * 100
        print(f"  [{val}] {name:<12} ({pid}): {count:7d} px ({pct:5.2f}%)")

    # Save Hitmap (8-bit grayscale image where pixel value == part_val, 0 == background)
    hitmap_img = Image.fromarray(label_map, mode='L')
    hitmap_path = os.path.join(out_dir, 'hitmap.png')
    hitmap_img.save(hitmap_path)
    print(f"\nSaved Hitmap to {hitmap_path}")

    # Generate Partition of Unity Masks and RGBA Part Layers
    smoothed_weights = np.zeros((8, H, W), dtype=np.float32)
    for val in range(1, 8):
        binary = (label_map == val).astype(np.float32)
        smoothed_weights[val] = scipy.ndimage.gaussian_filter(binary, sigma=0.8)

    sum_smoothed = np.sum(smoothed_weights[1:], axis=0)

    # Normalized weights
    norm_weights = np.zeros((8, H, W), dtype=np.float32)
    valid_mask = (sum_smoothed > 0) & opaque
    for val in range(1, 8):
        norm_weights[val][valid_mask] = (smoothed_weights[val][valid_mask] / sum_smoothed[valid_mask]) * alpha[valid_mask]

    # Verify partition of unity mathematically
    sum_norm = np.sum(norm_weights[1:], axis=0)
    diff = np.abs(sum_norm[opaque] - alpha[opaque])
    max_diff = np.max(diff)
    print(f"Maximum partition of unity deviation: {max_diff:.6f} (target: 0.000000)")
    assert max_diff < 1e-4, "Partition of unity failed!"

    # Save 8-bit masks and 32-bit RGBA part cutouts
    print("\nGenerating part assets...")
    for val, pid, name in PART_DEFS:
        weight_p = norm_weights[val]
        mask_8bit = np.clip(np.round(weight_p), 0, 255).astype(np.uint8)
        mask_path = os.path.join(masks_dir, f"{pid}_mask.png")
        Image.fromarray(mask_8bit, mode='L').save(mask_path)

        # 32-bit RGBA part image
        part_rgba = np.zeros((H, W, 4), dtype=np.uint8)
        part_rgba[:, :, :3] = rgb
        part_rgba[:, :, 3] = mask_8bit
        part_path = os.path.join(out_dir, f"{pid}.png")
        Image.fromarray(part_rgba, mode='RGBA').save(part_path)
        print(f"  Saved {pid}.png & {pid}_mask.png")

    # Backwards-compatible face_skin
    face_rgba = np.array(Image.open(os.path.join(out_dir, 'face.png')))
    Image.fromarray(face_rgba, mode='RGBA').save(os.path.join(out_dir, 'face_skin.png'))
    face_mask = np.array(Image.open(os.path.join(masks_dir, 'face_mask.png')))
    Image.fromarray(face_mask, mode='L').save(os.path.join(masks_dir, 'face_skin_mask.png'))

    # Save diagnostic debug flat color map
    debug_dir = os.path.join(base_dir, 'reference', 'portrait', 'debug')
    os.makedirs(debug_dir, exist_ok=True)
    palette = [
        [0, 0, 0],         # 0: bg
        [220, 50, 50],     # 1: hair (red)
        [255, 200, 100],   # 2: face (warm skin)
        [50, 200, 220],    # 3: hands (cyan)
        [240, 240, 240],   # 4: shirt (white)
        [180, 50, 220],    # 5: tie (purple)
        [50, 100, 220],    # 6: jacket (blue)
        [50, 220, 100],    # 7: trousers (green)
    ]
    debug_rgb = np.zeros((H, W, 3), dtype=np.uint8)
    for v in range(1, 8):
        debug_rgb[label_map == v] = palette[v]
    Image.fromarray(debug_rgb).save(os.path.join(debug_dir, 'parts_coverage_map.png'))

    # Save uncovered & overlap debug map
    uncovered_overlap = np.zeros((H, W, 3), dtype=np.uint8)
    uncovered_overlap[opaque & (label_map == 0)] = [255, 0, 0]
    Image.fromarray(uncovered_overlap).save(os.path.join(debug_dir, 'uncovered_and_overlap.png'))

    print(f"\nAll assets successfully generated and verified in {out_dir}")

if __name__ == '__main__':
    main()
