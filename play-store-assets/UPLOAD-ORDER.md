# Play Console আপলোড অর্ডার (v2.1.11)

সবকিছু রেডি। শুধু copy-paste আর drag-drop।

---

## 📦 যা যা আপলোড করবে (সব ফাইল `D:\APPS AND WEB\Suttro App\`-এ)

| # | ফাইল | কোথায় আপলোড | Specs |
|---|------|-------------|-------|
| 1 | `builds/suttro-v2.1.11.aab` | **Release → Production → Create release** | App Bundle, 8.9 MB |
| 2 | `play-store-assets/app-icon-512.png` | **Main store listing → Graphics → App icon** | 512×512 PNG |
| 3 | `play-store-assets/feature-graphic.png` | **Main store listing → Graphics → Feature graphic** | 1024×500 PNG |
| 4-11 | `play-store-assets/screenshots-final/01-08-*.jpg` | **Main store listing → Graphics → Phone screenshots** | drag all 8 in |

**IMPORTANT:** Phone screenshot-এ ফাইলগুলো ১ থেকে ৮ নম্বর সিরিয়ালে drag করো — Play Console drop order-এই preview carousel বানায়।

---

## 📸 Screenshot order (যেভাবে deliver হবে ফোনে)

| Slot | ফাইল | কী দেখাচ্ছে | Orientation |
|------|------|-------------|-------------|
| 1 | `01-gallery-hero.jpg` | **HERO** - সিমুলেশন গ্যালারি, "১৩টি সিমুলেশন · ৬টি বিষয় · সম্পূর্ণ ফ্রি" | Portrait |
| 2 | `02-atomic-structure-sim.jpg` | পরমাণুর গঠন (বোর মডেল) সিমুলেশন চলছে | Portrait |
| 3 | `03-photosynthesis-fullscreen.jpg` | সালোকসংশ্লেষণ সিমুলেশন ফুলস্ক্রিন মোডে | **Landscape** |
| 4 | `04-home-dashboard.jpg` | হোম পেজ - স্বাগতম, তিনটি বিষয়, ডেইলি প্রগ্রেস | Portrait |
| 5 | `05-guide-nctb.jpg` | জীববিজ্ঞান গাইড - ১৩ অধ্যায়, অনুশীলন প্রগ্রেস | Portrait |
| 6 | `06-video-class.jpg` | ইংরেজি ক্লাস রেকর্ডিং - Sentence Structure | Portrait |
| 7 | `07-daily-lesson.jpg` | আজকের পড়া + হোমওয়ার্ক জমা দেওয়ার সিস্টেম | Portrait |
| 8 | `08-profile-progress.jpg` | প্রোফাইল - Level, Streak, Badges | Portrait |

---

## 📋 সব field-এর Copy-Paste Text

### App Details

| Field | Value |
|-------|-------|
| App name | `Suttro` |
| Default language | Bengali (bn) |
| App or game | App |
| Free or paid | Free |

### Short description (80 chars max)
```
NCTB Class 9-10 science simulations in Bangla. বিজ্ঞান দেখো, বিজ্ঞান বোঝো।
```

### Full description
`PLAY_STORE_LISTING.md`-র "Full Description" section থেকে copy করো। (১৩০ লাইনের কাছাকাছি)

---

## 🧾 Categorization

| Field | Value |
|-------|-------|
| App category | **Education** |
| Tags | `Education`, `Learning`, `Science` |
| Email | `shaaoonn@gmail.com` |
| Website | `https://suttro.app` |
| Phone | leave blank |

---

## 🔒 App Content forms

### Privacy policy
- URL: `https://suttro.app/privacy`

### App access
- "All functionality is restricted" (login required)
- Test credentials: Sign in with Google - `shaaoonn@gmail.com`

### Ads: **No**

### Content rating
- Category: Education
- All questions: **No** (no violence, sex, language, drugs, gambling, UGC)
- Expected rating: **Everyone / PEGI 3**

### Target audience
- Ages: **13-15, 16-17, 18+**
- Appeals to children: **No**

### News/Government/Financial/Health: **No**

### Data safety
(full table in `PLAY_STORE_LISTING.md`)

Quick summary:
- Name, Email, User ID, Phone, Photos - collected, NOT shared, for account
- App interactions, crash logs, diagnostics - analytics
- Device IDs (FCM token) - push notifications
- Data encrypted in transit: **Yes**
- User can delete: **Yes** → `https://suttro.app/delete-account`

### Account deletion
- In-app: Profile → লগ আউট (delete via web)
- Web URL: `https://suttro.app/delete-account`

---

## 📝 Release notes (v2.1.11)

**Bengali (bn-BD):**
```
সূত্র (Suttro) - NCTB ক্লাস ৯-১০ এর প্রথম ইন্টারেক্টিভ সায়েন্স সিমুলেশন অ্যাপ।

• ১৩টি ইন্টারেক্টিভ সিমুলেশন - পদার্থ, রসায়ন, জীব, গণিত
• ৮৪০+ MCQ এবং সৃজনশীল প্রশ্ন
• ডেইলি ক্লাস রেকর্ডিং আর্কাইভ
• আজকের পড়া + হোমওয়ার্ক ট্র্যাকিং
• সম্পূর্ণ বাংলা UI, NCTB পাঠ্যক্রম অনুসারে
• Google Sign-In - এক ট্যাপে লগইন
• ফুলস্ক্রিন সিমুলেশন প্লেয়ার
```

**English (en-US):**
```
Suttro - Bangladesh's first interactive science simulation app for NCTB Class 9-10.

• 13 interactive simulations (Physics, Chemistry, Biology, Math)
• 840+ MCQ and creative questions
• Daily class recording archive
• Today's lesson + homework tracking
• Fully Bengali UI, aligned with NCTB curriculum
• Google Sign-In - one-tap login
• Fullscreen simulation player
```

---

## ✅ Final checklist

Publishing-এর আগে যা check করবে:

- [ ] AAB uploaded: `suttro-v2.1.11.aab` (versionCode 14)
- [ ] App icon 512×512 uploaded
- [ ] Feature graphic 1024×500 uploaded
- [ ] ৮টা screenshot order অনুযায়ী uploaded
- [ ] Short description pasted (≤80 chars)
- [ ] Full description pasted from `PLAY_STORE_LISTING.md`
- [ ] Category = Education, Tags added
- [ ] Privacy URL filled
- [ ] Content rating = Everyone
- [ ] Target age = 13+
- [ ] Data Safety submitted
- [ ] Account deletion URL filled
- [ ] Contains ads = No, In-app purchases = No
- [ ] Release notes pasted (bn + en)
- [ ] Countries: Bangladesh (+ যেসব দেশ চাও)
- [ ] Pricing = Free

সব ✅ হলে → **Start rollout to Production** বাটন চাপো।

---

*Review time: ৩-৭ দিন (প্রথম submission)*
