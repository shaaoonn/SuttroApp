# Play Console Step-by-Step (v2.1.11)

সবকিছু আগেই রেডি করে রাখা আছে। শুধু এই ধাপগুলো ক্রমিকভাবে follow করো।

---

## 📋 যে ফাইলগুলো লাগবে

সব `D:\APPS AND WEB\Suttro App\`-এ:

| কী লাগবে | ফাইল | স্ট্যাটাস |
|----------|------|-----------|
| App Bundle | `builds/suttro-v2.1.11.aab` | ✅ রেডি |
| App Icon | `play-store-assets/app-icon-512.png` | ✅ রেডি |
| Feature Graphic | `play-store-assets/feature-graphic.png` | ✅ রেডি |
| Phone Screenshots | `play-store-assets/screenshots-final/01-08*.jpg` | ✅ ৮টা রেডি |
| সব copy-paste text | `play-store-assets/UPLOAD-ORDER.md` | ✅ রেডি |

**বিস্তারিত order:** `play-store-assets/UPLOAD-ORDER.md` খোলো।

---

## Step 1 - Play Console login

URL: https://play.google.com/console/
→ Developer account login করো ($25 fee যদি আগে না দিয়ে থাকো)

---

## Step 2 - Create app

**Create app** button-এ click:

| Field | Value |
|-------|-------|
| App name | `Suttro` |
| Default language | Bengali (bn) |
| App or game | **App** |
| Free or paid | **Free** |
| Declarations | ✅ Tick both |

→ **Create app**

---

## Step 3 - Main store listing

Left menu → **Grow → Store presence → Main store listing**

### App details
- **App name:** `Suttro`
- **Short description** (copy from `UPLOAD-ORDER.md`)
- **Full description** (copy from `PLAY_STORE_LISTING.md` → "Full Description" section)

### Graphics (drag & drop)

| Slot | File |
|------|------|
| App icon | `play-store-assets/app-icon-512.png` |
| Feature graphic | `play-store-assets/feature-graphic.png` |
| Phone screenshots | All 8 files from `play-store-assets/screenshots-final/` (drag in 01 to 08 order) |
| Tablet screenshots | skip |

→ **Save**

---

## Step 4 - Store settings

Left menu → **Grow → Store presence → Store settings**

- App category: **Education**
- Tags: `Education`, `Learning`, `Science`
- Email: `shaaoonn@gmail.com`
- Website: `https://suttro.app`

→ **Save**

---

## Step 5 - App content (compliance)

Left menu → **Policy → App content**

সব ফর্ম একে একে ভরো। বিস্তারিত answer `UPLOAD-ORDER.md`-এ আছে:

- [x] Privacy policy: `https://suttro.app/privacy`
- [x] App access: Login required (Google)
- [x] Ads: No
- [x] Content rating: Education, all None → Everyone
- [x] Target audience: 13+
- [x] News/Gov/Finance/Health: No
- [x] Data safety: (see UPLOAD-ORDER.md table)
- [x] Account deletion: `https://suttro.app/delete-account`

---

## Step 6 - Production release

Left menu → **Release → Production → Create new release**

### Upload
- Drag `builds/suttro-v2.1.11.aab` into upload box
- Wait 2-5 min for processing

### Release name
Auto: `14 (2.1.11)` - keep as-is

### Release notes
Copy from `UPLOAD-ORDER.md` → "Release notes" section (Bengali + English)

→ **Save** → **Review release** → **Start rollout to Production**

---

## Step 7 - Wait

- First submission: **3-7 days**
- Email notification when approved
- Status: `In review` → `Approved` → Live

---

## 🆘 যদি কিছু reject হয়

| Issue | Fix |
|-------|-----|
| "Data Safety inaccurate" | UPLOAD-ORDER.md-র table পুনরায় দেখো |
| "Screenshots don't match app" | screenshots-final/ থেকে re-upload |
| "Feature graphic is placeholder" | feature-graphic.png re-upload |
| "Privacy policy missing" | https://suttro.app/privacy live আছে verify করো |

---

## ✅ Pre-submit checklist

`UPLOAD-ORDER.md` শেষে সম্পূর্ণ checklist আছে। সব tick না পড়লে submit করো না।

---

**Total time:** ~30-45 মিনিট (সব copy-paste ready থাকায়)
