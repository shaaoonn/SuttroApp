"""
Generate Android launcher icons + Play Store hi-res icon from the Suttro logo.

Android Adaptive Icon Spec (Android 8+):
- Total canvas: 108x108 dp
- Safe zone (never cropped): inner 66x66 dp (~61%)
- Outer 21 dp each side: cropped by launcher mask (circle, squircle, rounded square)

Strategy:
- Foreground drawable: ONLY the "সূত্র" logo (no "suttro.app" wordmark), scaled to 60% of canvas
- Background drawable: solid color (#F0FDFA light teal)
- Legacy icon (pre-Android 8): composite of bg + logo at 60%
- Play Store icon: 512x512 with full logo (wordmark included) on white bg at 70%

Run: python scripts/generate-android-icons.py
"""
from PIL import Image
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android" / "app" / "src" / "main" / "res"
SOURCE_LOGO = ROOT / "suttro_logo_without_bg.png"

FG_SIZES = {
    "mdpi":    108,
    "hdpi":    162,
    "xhdpi":   216,
    "xxhdpi":  324,
    "xxxhdpi": 432,
}

LEGACY_SIZES = {
    "mdpi":    48,
    "hdpi":    72,
    "xhdpi":   96,
    "xxhdpi":  144,
    "xxxhdpi": 192,
}

BG_COLOR = (240, 253, 250, 255)    # #F0FDFA
SAFE_ZONE_RATIO = 0.60


def crop_to_content(img):
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    bbox = img.split()[-1].getbbox()
    return img.crop(bbox) if bbox else img


def extract_logo_only(source):
    """Drop the 'suttro.app' wordmark (bottom ~25%) and return just the সূত্র glyph."""
    img = Image.open(source).convert("RGBA")
    w, h = img.size
    logo = img.crop((0, 0, w, int(h * 0.75)))
    return crop_to_content(logo)


def fit_into_canvas(fg, canvas_size, content_ratio, bg=None):
    canvas = Image.new("RGBA", (canvas_size, canvas_size), bg if bg else (0, 0, 0, 0))
    target = int(canvas_size * content_ratio)
    ar = fg.width / fg.height
    if ar >= 1:
        new_w = target
        new_h = int(target / ar)
    else:
        new_h = target
        new_w = int(target * ar)
    resized = fg.resize((new_w, new_h), Image.LANCZOS)
    x = (canvas_size - new_w) // 2
    y = (canvas_size - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def main():
    if not SOURCE_LOGO.exists():
        print(f"ERROR: source not found: {SOURCE_LOGO}", file=sys.stderr)
        sys.exit(1)

    print(f"Source: {SOURCE_LOGO}")
    logo_only = extract_logo_only(SOURCE_LOGO)
    print(f"Logo (wordmark stripped): {logo_only.size}\n")

    # 1. Adaptive foreground (transparent bg, logo at 60% -> inside safe zone)
    print("Adaptive foreground drawables:")
    for density, size in FG_SIZES.items():
        out_dir = RES / f"mipmap-{density}"
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / "ic_launcher_foreground.png"
        fit_into_canvas(logo_only, size, SAFE_ZONE_RATIO, bg=None).save(path, "PNG", optimize=True)
        print(f"  {path.relative_to(ROOT)}  {size}x{size}")

    # 2. Legacy icons (solid bg + logo at 60%)
    print("\nLegacy launcher icons (pre-Android 8):")
    for density, size in LEGACY_SIZES.items():
        out_dir = RES / f"mipmap-{density}"
        for fname in ("ic_launcher.png", "ic_launcher_round.png"):
            path = out_dir / fname
            fit_into_canvas(logo_only, size, SAFE_ZONE_RATIO, bg=BG_COLOR).save(path, "PNG", optimize=True)
            print(f"  {path.relative_to(ROOT)}  {size}x{size}")

    # 3. Play Store hi-res icon (512x512, white bg, full logo with wordmark at 70%)
    print("\nPlay Store hi-res icon:")
    playstore_dir = ROOT / "playstore-assets"
    playstore_dir.mkdir(exist_ok=True)
    full_logo = Image.open(SOURCE_LOGO).convert("RGBA")
    full_logo = crop_to_content(full_logo)
    ps_icon = fit_into_canvas(full_logo, 512, 0.75, bg=(255, 255, 255, 255))
    ps_path = playstore_dir / "icon-512.png"
    ps_icon.save(ps_path, "PNG", optimize=True)
    print(f"  {ps_path.relative_to(ROOT)}  512x512")

    print("\nDone.")


if __name__ == "__main__":
    main()
