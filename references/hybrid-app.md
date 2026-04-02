# সূত্র — Hybrid App, Offline & Deep Linking

## Hybrid Architecture

### "Build Once, Run Everywhere"
suttro.app is a responsive Next.js PWA. The website IS the app.
Mobile apps are thin WebView shells that load suttro.app.

```
suttro.app (Next.js PWA) ← Single codebase
  ├── Desktop Chrome/Firefox → direct access
  ├── Mobile Chrome/Safari → responsive, full features
  ├── Android App (Play Store) → WebView loading suttro.app
  ├── iOS App (App Store) → WKWebView loading suttro.app
  └── PWA Install → Home screen shortcut + service worker
```

### Why This Model
- ONE codebase to maintain (not 3: web + Android + iOS)
- New features deploy to web → app gets them instantly (no app update needed)
- Shikho spent $6.5M on separate native apps. We achieve similar UX for near-zero extra cost
- Responsive web already looks/feels like an app on mobile

### WebView Shell (Android)
```kotlin
// Minimal Android app — just a WebView
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        webView.loadUrl("https://suttro.app")
        setContentView(webView)
    }
}
```

### Alternative: Capacitor.js
```bash
npx cap init suttro app.suttro.main --web-dir=out
npx cap add android
npx cap add ios
npx cap sync
```
Capacitor wraps the Next.js output as a native app with access to:
- Push notifications
- Device storage (for offline content)
- Camera (future: scan book pages → find simulation)
- App Store/Play Store distribution

---

## Offline Content Model

### Online Mode (Default)
- All content streams from suttro.app server
- Videos: HLS adaptive streaming
- Simulations: Load on demand from CDN
- User data: Syncs to Supabase in real-time

### Download for Offline
Each video and simulation has a download button (⬇️ icon).

#### Video Downloads
```
Download flow:
1. User taps ⬇️ on a video
2. App downloads encrypted HLS chunks
3. Stored in app-private directory (not accessible from file manager)
4. License key bound to device HWID
5. Plays ONLY inside Suttro app

Storage format:
/app-private/downloads/
  ├── video-ohms-law-class/
  │   ├── manifest.enc      (encrypted HLS manifest)
  │   ├── chunk-001.enc     (encrypted video chunks)
  │   ├── chunk-002.enc
  │   └── license.key       (device-bound, expires with subscription)
```

#### Simulation Downloads
```
Simulations are lightweight (HTML/JS/CSS, ~50-200KB each).
Service Worker caches them automatically.

/sw-cache/simulations/
  ├── ohms-law/           (cached React component + assets)
  ├── acid-base/
  └── cell-division/
```

### DRM / Content Protection
```
Protection layers:
1. Encrypted storage (AES-256, device-bound key)
2. License key expires with subscription
3. Files in app-private directory (Android: getFilesDir())
4. No share intent registered for .enc files
5. Screenshot/screen recording blocked in app (FLAG_SECURE on Android)
6. Unsubscribe → license invalidated → downloads unplayable
```

### What Users CAN and CANNOT Do
| Action | Allowed? |
|--------|----------|
| Watch online (stream) | ✅ Yes |
| Download for offline | ✅ Yes (inside app only) |
| Watch offline in app | ✅ Yes |
| Share LINK to WhatsApp | ✅ Yes (deep link) |
| Share FILE to WhatsApp | ❌ No |
| Find in file manager | ❌ No |
| Open in other video player | ❌ No |
| Screen record | ❌ Blocked |
| Copy/transfer to PC | ❌ No |

---

## Deep Linking

### URL Pattern
```
suttro.app/sim/{slug}        → Simulation
suttro.app/class/{slug}      → Class video
suttro.app/chapter/{id}      → Chapter page
```

### Share Flow
```
1. User clicks "Share" button on any simulation/video
2. Native share sheet opens (or copy link)
3. Link format: suttro.app/sim/ohms-law

4. Recipient clicks link:
   a. App installed → Android App Link / iOS Universal Link → opens in app
   b. App NOT installed → opens suttro.app/sim/ohms-law in browser

5. Smart redirect page (browser fallback):
   ┌─────────────────────────────────┐
   │  সূত্র | suttro.app            │
   │                                 │
   │  ওহমের সূত্র সিমুলেশন          │
   │  [📱 অ্যাপ নামাও]              │
   │  [🌐 ব্রাউজারে দেখো]           │
   └─────────────────────────────────┘

6. If "অ্যাপ নামাও":
   → Play Store → Install → Deferred deep link:
   → App opens → auto-navigates to /sim/ohms-law

7. If "ব্রাউজারে দেখো":
   → Simulation runs in mobile browser (hybrid advantage!)
```

### Android App Links Setup
```xml
<!-- AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="suttro.app" />
</intent-filter>
```

```json
// suttro.app/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.suttro.main",
    "sha256_cert_fingerprints": ["..."]
  }
}]
```

### iOS Universal Links Setup
```json
// suttro.app/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAMID.app.suttro.main",
      "paths": ["/sim/*", "/class/*", "/chapter/*"]
    }]
  }
}
```

### Deferred Deep Linking
For users who install AFTER clicking a shared link:
1. Smart page stores intended URL in a short-lived token
2. After app install, app checks for pending deep link token
3. Auto-navigates to the intended content

Implementation options:
- Firebase Dynamic Links (deprecated but still works)
- Branch.io (free tier available)
- Custom: store in cookies/localStorage before redirect → app reads on first open

---

## PWA Configuration

### next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/suttro\.app\/sim\/.*/,
      handler: 'CacheFirst',
      options: { cacheName: 'simulations' }
    },
    {
      urlPattern: /^https:\/\/suttro\.app\/api\/.*/,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-calls' }
    }
  ]
});
```

### manifest.json
```json
{
  "name": "সূত্র | suttro.app",
  "short_name": "সূত্র",
  "description": "বিজ্ঞান দেখো, বিজ্ঞান বোঝো।",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0B1D3A",
  "theme_color": "#1B6B4A",
  "orientation": "any",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
