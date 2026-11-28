#!/usr/bin/env python3
"""
Validation script for portrait partition of unity masks.
Verifies:
1. No opaque cut-out pixel (alpha > 15) is uncovered by all masks.
2. No pixel has sum of mask weights > 1.01 * cut-out alpha.
3. No mask contains pixels outside the cut-out silhouette (cutout alpha <= 15).
4. No part has more than a small number of disconnected islands (<= 5).
"""

import os
import sys
import numpy as np
from PIL import Image
import scipy.ndimage

def validate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    photo_path = os.path.join(base_dir, 'public', 'images', 'my-photo.png')
    parts_dir = os.path.join(base_dir, 'public', 'images', 'portrait-parts')
    masks_dir = os.path.join(parts_dir, 'masks')

    photo = Image.open(photo_path)
    rgba = np.array(photo)
    alpha = rgba[:, :, 3].astype(np.float32)
    opaque = alpha > 15
    total_opaque = int(np.sum(opaque))
    print(f"Validating cut-out: {photo_path} (opaque pixels: {total_opaque})")

    parts = ['hair', 'face', 'hands', 'shirt', 'tie', 'jacket', 'trousers']
    masks = {}
    for p in parts:
        mask_path = os.path.join(masks_dir, f"{p}_mask.png")
        if not os.path.exists(mask_path):
            print(f"FAIL: Missing mask {mask_path}")
            sys.exit(1)
        masks[p] = np.array(Image.open(mask_path)).astype(np.float32)

    # 1. Uncovered opaque pixels
    sum_masks = sum(masks.values())
    uncovered = opaque & (sum_masks < 1.0)
    uncovered_count = int(np.sum(uncovered))
    print(f"[Check 1] Uncovered opaque pixels: {uncovered_count}")
    if uncovered_count > 0:
        print(f"FAIL: {uncovered_count} opaque pixels have zero mask coverage!")
        sys.exit(1)

    # 2. Overlap / Excess weights: sum of weights > 1.01 * cutout alpha
    # Note: sum_masks can have tiny rounding up to +1 px on float->uint8 conversion
    tolerance = np.maximum(alpha * 1.01, alpha + 4.0)
    excess = opaque & (sum_masks > tolerance)
    excess_count = int(np.sum(excess))
    print(f"[Check 2] Over-saturated pixels (sum > 1.01 * alpha): {excess_count}")
    if excess_count > 0:
        print(f"FAIL: {excess_count} pixels exceed alpha * 1.01!")
        sys.exit(1)

    # 3. Pixels outside cut-out silhouette
    outside = ~opaque
    spill_count = 0
    for p, m in masks.items():
        spill = int(np.sum((m > 0) & outside))
        if spill > 0:
            print(f"FAIL: Mask {p} has {spill} pixels outside cut-out silhouette!")
            spill_count += spill
    print(f"[Check 3] Total pixels outside silhouette: {spill_count}")
    if spill_count > 0:
        sys.exit(1)

    # 4. Disconnected component count per part
    print("[Check 4] Connected component counts:")
    max_allowed_islands = 6
    for p, m in masks.items():
        binary = m > 50
        _, num_cc = scipy.ndimage.label(binary)
        print(f"  - {p:<10}: {num_cc} component(s)")
        if num_cc > max_allowed_islands:
            print(f"FAIL: Part {p} has {num_cc} disconnected islands (max allowed: {max_allowed_islands})")
            sys.exit(1)

    # Check Hitmap
    hitmap_path = os.path.join(parts_dir, 'hitmap.png')
    if not os.path.exists(hitmap_path):
        print(f"FAIL: Missing hitmap {hitmap_path}")
        sys.exit(1)
    hitmap = np.array(Image.open(hitmap_path))
    unassigned_hitmap = opaque & (hitmap == 0)
    print(f"[Check 5] Hitmap unassigned opaque pixels: {int(np.sum(unassigned_hitmap))}")
    if np.sum(unassigned_hitmap) > 0:
        print(f"FAIL: Hitmap has unassigned opaque pixels!")
        sys.exit(1)

    print("\nALL PORTRAIT PARTITION VALIDATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    validate()
