# Play Console - Step-by-Step Submission Guide
**Just follow top-to-bottom. Every click, every paste - pre-written.**

---

## 📋 Files you'll need (all in `D:\APPS AND WEB\Suttro App\`)

| File | Purpose |
|------|---------|
| `suttro-v2.1.7-release.aab` | Upload as App Bundle |
| `suttro-v2.1.7-release.apk` | Install on your phone for screenshots |
| `play-store-assets/feature-graphic.html` | Open in Chrome → screenshot for Feature Graphic |
| `PLAY_STORE_LISTING.md` | Source text for all copy-paste fields |

---

## Step 0 - Capture phone screenshots (15 min, one-time)

**Install APK:**
1. Copy `suttro-v2.1.7-release.apk` to your phone
2. Tap → Install (allow "unknown sources" if asked)
3. Open the app, log in

**Capture 8 screenshots** (press Volume Down + Power together on each screen):
| # | Screen | Navigate to |
|---|--------|-------------|
| 1 | Home page with hero | Open app → Home tab |
| 2 | Simulations gallery | Bottom nav → Sims |
| 3 | Ohm's Law simulation (running) | Tap "Ohm's Law" card → let it load |
| 4 | Class archive | Bottom nav → Classes |
| 5 | Video class playing | Tap any class → play |
| 6 | MCQ Exam page | Bottom nav → Exams → tap one |
| 7 | Guide / NCTB chapter | Bottom nav → Guide |
| 8 | Dashboard / profile | Bottom nav → Profile |

Screenshots will be in `Internal Storage/Pictures/Screenshots/`. Transfer to PC.

**Requirements Play Store enforces:**
- Min 2, max 8 per device type
- 320-3840px on each side
- Ratio 16:9 or 9:16 (phone screenshots are auto-portrait 9:16)
- PNG or JPEG

---

## Step 1 - Generate Feature Graphic PNG (3 min)

1. Double-click `play-store-assets/feature-graphic.html` - opens in Chrome
2. Press **F12** → DevTools opens
3. Press **Ctrl+Shift+M** → device toolbar (top bar appears)
4. Top bar: set **Width=1024, Height=500**, DPR=1
5. In DevTools, open command menu: **Ctrl+Shift+P**
6. Type: `screenshot` → pick **"Capture full size screenshot"**
7. PNG saves to Downloads. Rename to `feature-graphic.png`. Move to `play-store-assets/`.

✅ Done. This is the 1024×500 image Play Store requires.

---

## Step 2 - Play Console: Create the app

**URL**: https://play.google.com/console/
→ Click **"Create app"** (top-right)

| Field | Answer |
|-------|--------|
| App name | `Suttro` |
| Default language | `English (United States) - en-US` |
| App or game | **App** |
| Free or paid | **Free** |
| Declarations (Developer Program Policies) | ✅ Tick |
| US export laws | ✅ Tick |

→ **Create app**

---

## Step 3 - Main store listing

**Left menu** → **Grow → Store presence → Main store listing**

### App details

**App name** (30 char max):
```
Suttro
```

**Short description** (80 char max):
```
NCTB Class 9-10 science simulations in Bangla. বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
```

**Full description** (4000 char max) - copy from `PLAY_STORE_LISTING.md` section "Full description"

### Graphics

| Asset | File | Specs |
|-------|------|-------|
| App icon | (auto from AAB, or upload `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`) | 512×512 PNG |
| Feature graphic | `play-store-assets/feature-graphic.png` | 1024×500 PNG |
| Phone screenshots | 8 PNG files from Step 0 | 16:9 or 9:16 |
| Tablet screenshots | *(optional - skip)* | - |

→ **Save**

---

## Step 4 - Store settings

**Left menu** → **Grow → Store presence → Store settings**

| Field | Answer |
|-------|--------|
| App category | **Education** |
| Tags | `Education`, `Learning`, `Science` |
| Store listing contact - Email | `shaaoonn@gmail.com` |
| Phone (optional) | leave blank |
| Website | `https://suttro.app` |
| External marketing | ✅ allow (optional) |

→ **Save**

---

## Step 5 - App content (compliance forms)

**Left menu** → **Policy → App content**

### 5a. Privacy policy
- URL: `https://suttro.app/privacy`
- → Save

### 5b. App access
- Q: "Is all functionality available without restrictions, such as a login?"
- A: **All functionality is restricted** (login required)
- Provide test credentials:
  - Username: *(your test phone/Google)*
  - Password: *(OTP-based, note "phone OTP auth, no password")*
- Instructions: `Sign in with Google or Phone OTP. Test account: shaaoonn@gmail.com`
- → Save

### 5c. Ads
- Q: "Does your app contain ads?"
- A: **No**
- → Save

### 5d. Content rating
- Start questionnaire
- Email: `shaaoonn@gmail.com`
- Category: **Education**
- All questions: **No** (no violence, no sex, no profanity, no drugs, no gambling, no user-generated content visible to others)
- → Submit → Expected rating: **Everyone / PEGI 3 / IARC all-ages**

### 5e. Target audience
- Target age groups: **Ages 13-15, 16-17, 18+** (Class 9-10 = age 14-16)
- Appeals to children? **No**
- → Save

### 5f. News app
- Is this a news app? **No**

### 5g. COVID-19 contact tracing
- No

### 5h. Data safety
Copy answers from `PLAY_STORE_LISTING.md` section "Data Safety". Key highlights:

| Data type | Collected? | Shared? | Purpose |
|-----------|-----------|---------|---------|
| Name | Yes | No | Account functionality |
| Email | Yes | No | Account functionality, Communications |
| User ID | Yes | No | Account functionality, Analytics |
| Phone number | Yes | No | Account functionality |
| Photos | Yes | No | App functionality (profile avatar) |
| App interactions | Yes | No | Analytics, App functionality |
| Device/Other IDs | Yes | No | Analytics, Fraud prevention |
| Crash logs | Yes | No | Analytics |
| Diagnostics | Yes | No | Analytics |

- Data encrypted in transit? **Yes**
- Users can request data deletion? **Yes** → URL: `https://suttro.app/delete-account`

### 5i. Government apps
- Is this a government app? **No**

### 5j. Financial features
- Does your app have financial features? **No**

### 5k. Health
- Health app? **No**

### 5l. Account deletion
- Q: "Do you provide a way for users to request account deletion?"
- A: **Yes**
- Web URL: `https://suttro.app/delete-account`
- In-app: Profile → Delete Account

---

## Step 6 - Production release

**Left menu** → **Release → Production** → **Create new release**

### Upload
- Drag `suttro-v2.1.7-release.aab` into the upload box
- Wait for processing (2-5 min)

### Release name
Auto-filled from AAB: `10 (2.1.7)` - leave as-is

### Release notes

**English (en-US):**
```
v2.1.7
• Rebranded app name to "Suttro" for better global reach
• Improved SEO for web discoverability
• Android 15 (API 35) + 16 KB page-size compliance
• Updated launcher icon and brand assets
• Bug fixes and performance improvements
```

**Bengali (bn-BD):** (add language first if not added)
```
v2.1.7
• অ্যাপের নাম "Suttro" করা হলো - সহজে খুঁজে পাওয়ার জন্য
• ওয়েবসাইট SEO উন্নত করা হলো
• Android 15 + 16 KB পেজ-সাইজ সাপোর্ট
• আইকন ও ব্র্যান্ড আপডেট
• বাগ ফিক্স ও পারফরম্যান্স উন্নতি
```

→ **Save** → **Review release** → **Start rollout to Production**

---

## Step 7 - Wait for review

- Review time: **1-7 days** (first submission is usually longer)
- Status: `In review` → `Approved` → Live on Play Store
- You'll get an email when live

---

## 🆘 If something gets rejected

Common reasons + fixes:
| Issue | Fix |
|-------|-----|
| "Data Safety inaccurate" | Recheck each data type - Firebase Analytics = yes, FCM = yes |
| "Screenshots don't match app" | Re-capture from real APK, not mockups |
| "Privacy policy missing item" | Add to `/privacy` page, redeploy web |
| "Feature graphic contains placeholder" | Use the real one from Step 1 |

---

## ✅ Final checklist before clicking "Start rollout"

- [ ] 8 real phone screenshots uploaded
- [ ] `feature-graphic.png` uploaded (1024×500)
- [ ] Short description ≤ 80 chars ✓
- [ ] Full description ≤ 4000 chars ✓
- [ ] Data Safety form complete
- [ ] Content Rating submitted (Everyone)
- [ ] Target audience set (13-18+)
- [ ] Privacy URL: https://suttro.app/privacy ✓
- [ ] Account deletion URL: https://suttro.app/delete-account ✓
- [ ] AAB uploaded (`suttro-v2.1.7-release.aab`)
- [ ] Release notes written (en + bn)

Once all ✅ → **Start rollout to Production**.

---

*Total time if screenshots ready: ~30 min. First review: 1-7 days.*
