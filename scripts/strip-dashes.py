#!/usr/bin/env python3
"""Replace em-dash (U+2014) and en-dash (U+2013) with hyphen-minus across source."""
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

INCLUDE_DIRS = ["src", "public", "android/app/src", "play-store-assets"]
INCLUDE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".md",
                ".kt", ".java", ".xml", ".gradle", ".html", ".json", ".txt"}
SKIP_PARTS = {"node_modules", ".next", ".git", "build", ".gradle", "dist", "out"}

EM = "\u2014"
EN = "\u2013"

modified = 0
scanned = 0

def process(path):
    global modified, scanned
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = f.read()
    except (UnicodeDecodeError, OSError):
        return
    scanned += 1
    if EM not in data and EN not in data:
        return
    new = data.replace(EM, "-").replace(EN, "-")
    if new != data:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(new)
        modified += 1
        print(f"  {os.path.relpath(path, ROOT)}")

def walk(base):
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames[:] = [d for d in dirnames if d not in SKIP_PARTS]
        for name in filenames:
            ext = os.path.splitext(name)[1].lower()
            if ext in INCLUDE_EXTS:
                process(os.path.join(dirpath, name))

for d in INCLUDE_DIRS:
    full = os.path.join(ROOT, d)
    if os.path.isdir(full):
        walk(full)

# root-level docs
for name in os.listdir(ROOT):
    full = os.path.join(ROOT, name)
    if os.path.isfile(full) and os.path.splitext(name)[1].lower() in INCLUDE_EXTS:
        process(full)

print(f"\nScanned: {scanned}  Modified: {modified}")
