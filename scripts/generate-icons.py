"""
generate-icons.py
Generates PNG app icons for the Suttro education platform.
Design: solid green circle (#1B6B4A) with anti-aliased edges on transparent background.
Uses only Python built-in modules (no pip packages needed).

Usage: python3 scripts/generate-icons.py
"""

import struct, zlib, os, math

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'icons')
BG_R, BG_G, BG_B = 27, 107, 74


def make_png(size):
    cx = cy = size / 2.0
    radius = size / 2.0

    # Build raw pixel data (filter byte 0 + RGBA for each pixel per row)
    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter: None
        for x in range(size):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            dist = math.sqrt(dx * dx + dy * dy)
            if dist <= radius - 0.5:
                raw.extend([BG_R, BG_G, BG_B, 255])
            elif dist <= radius + 0.5:
                alpha = max(0.0, min(1.0, radius + 0.5 - dist))
                raw.extend([BG_R, BG_G, BG_B, round(alpha * 255)])
            else:
                raw.extend([0, 0, 0, 0])

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    compressed = zlib.compress(bytes(raw), 9)

    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for size in SIZES:
        png_data = make_png(size)
        fpath = os.path.join(OUT_DIR, f'icon-{size}.png')
        with open(fpath, 'wb') as f:
            f.write(png_data)
        print(f'  OK  icon-{size}.png  ({len(png_data)} bytes)')
    print(f'\nDone - {len(SIZES)} icons written to {OUT_DIR}')
    print('Note: Icons show the green circle. The full branded design with')
    print('Bengali text is in icon.svg.')


if __name__ == '__main__':
    main()
