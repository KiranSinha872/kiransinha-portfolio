#!/usr/bin/env python3
"""
Generate zoomed-in boundary crops of tricky boundaries:
- face/hair (forehead, temples, hairline)
- face/neck (chin, jaw, collar junction)
- shirt/tie (collar points, knot, placket)
- jacket/trousers (waistband, jacket hem)
- hands/sleeves (pocket hand and sleeve cuff)
Save to reference/portrait/verification/
"""

import os
import numpy as np
from PIL import Image

def generate_crops():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(base_dir, 'reference', 'portrait', 'verification')
    os.makedirs(out_dir, exist_ok=True)

    photo_path = os.path.join(base_dir, 'public', 'images', 'my-photo.png')
    photo = Image.open(photo_path)

    # High-resolution boundary crops from full-resolution 515x1024 photo:
    # 1. face / hair: forehead, temple, hairline (Y: 90..230, X: 30..220)
    crop_face_hair = photo.crop((30, 90, 220, 230))
    crop_face_hair.save(os.path.join(out_dir, 'crop_face_hair.png'))

    # 2. face / neck: chin, jawline, neck, collar junction (Y: 210..340, X: 90..240)
    crop_face_neck = photo.crop((90, 210, 240, 340))
    crop_face_neck.save(os.path.join(out_dir, 'crop_face_neck.png'))

    # 3. shirt / tie: collar points, tie knot, shirt placket (Y: 290..480, X: 110..240)
    crop_shirt_tie = photo.crop((110, 290, 240, 480))
    crop_shirt_tie.save(os.path.join(out_dir, 'crop_shirt_tie.png'))

    # 4. jacket / trousers: jacket hem, waist, waistband (Y: 650..820, X: 80..380)
    crop_jacket_trousers = photo.crop((80, 650, 380, 820))
    crop_jacket_trousers.save(os.path.join(out_dir, 'crop_jacket_trousers.png'))

    # 5. hands / sleeves: pocket hand, wrist, sleeve cuff (Y: 680..860, X: 80..180)
    crop_hands_sleeves = photo.crop((80, 680, 180, 860))
    crop_hands_sleeves.save(os.path.join(out_dir, 'crop_hands_sleeves.png'))

    print("All zoomed boundary crops generated in", out_dir)

if __name__ == '__main__':
    generate_crops()
