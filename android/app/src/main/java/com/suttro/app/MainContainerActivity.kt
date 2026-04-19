package com.suttro.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Message
import android.provider.MediaStore
import android.util.Log
import android.view.HapticFeedbackConstants
import android.view.View
import android.view.ViewGroup
import android.view.animation.AlphaAnimation
import android.view.animation.OvershootInterpolator
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.RelativeLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import java.io.File
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.CircleCrop
import com.facebook.shimmer.ShimmerFrameLayout
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.firebase.messaging.FirebaseMessaging

class MainContainerActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager
    private lateinit var webView: WebView
    private lateinit var bottomNav: BottomNavigationView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var shimmerLayout: ShimmerFrameLayout

    // Toolbar views
    private lateinit var toolbarContainer: FrameLayout
    private lateinit var homeToolbar: RelativeLayout
    private lateinit var pageToolbar: RelativeLayout
    private lateinit var toolbarBack: ImageButton
    private lateinit var toolbarTitle: TextView
    private lateinit var toolbarAvatar: ImageView
    private lateinit var avatarContainer: FrameLayout
    private lateinit var bellContainer: FrameLayout
    private lateinit var badgeCount: TextView

    private var sessionInjected = false
    private var isNavigatingFromTab = false
    private var currentPath = "/"
    private var isFirstLoad = true

    // ═══ File chooser state (for <input type="file">) ═══
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraPhotoUri: Uri? = null
    private var pendingCameraRequest: PermissionRequest? = null

    // Launcher for file chooser (system picker + camera capture)
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val callback = filePathCallback
        filePathCallback = null
        if (callback == null) return@registerForActivityResult

        val uris: Array<Uri>? = if (result.resultCode != RESULT_OK) {
            null
        } else {
            // If user took a camera photo, data.data is null but cameraPhotoUri holds the result
            val fromChooser = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
            when {
                !fromChooser.isNullOrEmpty() -> fromChooser
                cameraPhotoUri != null -> arrayOf(cameraPhotoUri!!)
                else -> null
            }
        }
        callback.onReceiveValue(uris)
        cameraPhotoUri = null
    }

    // Launcher for camera permission (from WebView getUserMedia or <input capture>)
    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        val req = pendingCameraRequest
        pendingCameraRequest = null
        if (granted && req != null) {
            req.grant(req.resources)
        } else {
            req?.deny()
        }
    }

    // Tab path mapping — 4 tabs
    private val tabPaths = mapOf(
        R.id.nav_home to "/",
        R.id.nav_guide to "/guide",
        R.id.nav_exam to "/exams",
        R.id.nav_profile to "/dashboard"
    )

    private val tabTitles = mapOf(
        "/" to "সূত্র",
        "/guide" to "শেখো",
        "/exams" to "পরীক্ষা",
        "/dashboard" to "আমি"
    )

    private val subPageTitles = mapOf(
        "/simulations" to "সিমুলেশন",
        "/classes" to "সব ক্লাস",
        "/daily" to "আজকের পড়া",
        "/review" to "SRS রিভিউ",
        "/achievements" to "অ্যাচিভমেন্ট",
        "/leaderboard" to "লিডারবোর্ড",
        "/pricing" to "প্রাইসিং",
        "/profile" to "প্রোফাইল সেটিংস",
        "/about" to "সম্পর্কে",
        "/terms" to "শর্তাবলী",
        "/privacy" to "গোপনীয়তা নীতি",
        "/payment/success" to "পেমেন্ট সফল",
        "/payment/failed" to "পেমেন্ট ব্যর্থ"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        sessionManager = SessionManager(this)
        initViews()
        setupWebView()
        setupBottomNav()
        setupBackNavigation()
        setupSwipeRefresh()
        loadUserAvatar()

        // Avatar click → dashboard
        avatarContainer.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
            isNavigatingFromTab = true
            navigateSPA("/dashboard")
            bottomNav.selectedItemId = R.id.nav_profile
        }

        // Bell click → dashboard (notifications area)
        bellContainer.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
            isNavigatingFromTab = true
            navigateSPA("/dashboard")
            bottomNav.selectedItemId = R.id.nav_profile
        }

        // Back button
        toolbarBack.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
            if (webView.canGoBack()) {
                webView.goBack()
            } else {
                isNavigatingFromTab = true
                navigateSPA("/")
                bottomNav.selectedItemId = R.id.nav_home
            }
        }

        showHomeToolbar()
        showShimmer()

        // Request notification permission (Android 13+)
        requestNotificationPermission()

        // Register FCM token
        registerFCMToken()

        // Handle deep link from notification or external
        val notificationPath = intent.getStringExtra("deep_link_path")
        if (notificationPath != null) {
            loadPath(notificationPath)
        } else if (!handleDeepLink(intent)) {
            loadPath("/")
        }
    }

    // ═══ FCM Setup ═══

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        Log.d("SuttroFCM", "Notification permission granted: $granted")
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun registerFCMToken() {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Log.d("SuttroFCM", "FCM Token: $token")
                // Token will be sent to server by SuttroFirebaseService.onNewToken()
            } else {
                Log.e("SuttroFCM", "Failed to get FCM token", task.exception)
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun initViews() {
        toolbarContainer = findViewById(R.id.toolbar_container)
        homeToolbar = findViewById(R.id.home_toolbar)
        pageToolbar = findViewById(R.id.page_toolbar)
        toolbarBack = findViewById(R.id.toolbar_back)
        toolbarTitle = findViewById(R.id.toolbar_title)
        toolbarAvatar = findViewById(R.id.toolbar_avatar)
        avatarContainer = findViewById(R.id.avatar_container)
        bellContainer = findViewById(R.id.bell_container)
        badgeCount = findViewById(R.id.badge_count)
        webView = findViewById(R.id.webview)
        bottomNav = findViewById(R.id.bottom_nav)
        progressBar = findViewById(R.id.progress_bar)
        swipeRefresh = findViewById(R.id.swipe_refresh)
        shimmerLayout = findViewById(R.id.shimmer_layout)
    }

    // ─── Deep Linking (#11) ───

    private fun handleDeepLink(intent: Intent?): Boolean {
        val uri = intent?.data ?: return false
        if (uri.host == "suttro.app") {
            val path = uri.path ?: "/"
            loadPath(path)
            updateToolbarForPath(path)
            val tabId = tabPaths.entries.find { (_, p) ->
                if (p == "/") path == "/" else path.startsWith(p)
            }?.key
            tabId?.let { bottomNav.selectedItemId = it }
            return true
        }
        return false
    }

    // ─── User Avatar ───

    private fun loadUserAvatar() {
        val avatarUrl = sessionManager.getUserAvatarUrl()
        if (!avatarUrl.isNullOrBlank()) {
            Glide.with(this)
                .load(avatarUrl)
                .transform(CircleCrop())
                .placeholder(R.drawable.ic_avatar_default)
                .error(R.drawable.ic_avatar_default)
                .into(toolbarAvatar)
        }
    }

    // ─── Toolbar States ───

    private fun showHomeToolbar() {
        homeToolbar.visibility = View.VISIBLE
        pageToolbar.visibility = View.GONE
    }

    private fun showPageToolbar(title: String) {
        homeToolbar.visibility = View.GONE
        pageToolbar.visibility = View.VISIBLE
        toolbarTitle.text = title
    }

    // ─── Shimmer Loading (#5) ───

    private fun showShimmer() {
        shimmerLayout.visibility = View.VISIBLE
        shimmerLayout.startShimmer()
        webView.visibility = View.INVISIBLE
    }

    private fun hideShimmer() {
        if (shimmerLayout.visibility == View.VISIBLE) {
            shimmerLayout.stopShimmer()
            // Crossfade animation
            val fadeOut = AlphaAnimation(1f, 0f).apply { duration = 250 }
            shimmerLayout.startAnimation(fadeOut)
            shimmerLayout.visibility = View.GONE
            webView.visibility = View.VISIBLE
            val fadeIn = AlphaAnimation(0f, 1f).apply { duration = 250 }
            webView.startAnimation(fadeIn)
        }
    }

    // ─── Badge (#3) ───

    private fun updateBadgeCount(count: Int) {
        if (count > 0) {
            badgeCount.text = if (count > 99) "99+" else count.toString()
            badgeCount.visibility = View.VISIBLE
        } else {
            badgeCount.visibility = View.GONE
        }
    }

    // ─── SwipeRefresh (DISABLED — was breaking WebView scroll) ───
    //
    // SwipeRefreshLayout's `canChildScrollUp` callback uses webView.scrollY,
    // but modern Chromium-based WebView keeps view-level scrollY at 0 while
    // the HTML document scrolls internally. That made SwipeRefresh believe
    // the WebView was always "at top", so it intercepted every downward
    // drag as a pull-to-refresh gesture — killing vertical scrolling across
    // every page. The WebView is fully kept as a child of SwipeRefreshLayout
    // for layout compatibility, but refresh behavior is turned off.
    //
    // If pull-to-refresh is re-added later, use `view.canScrollVertically(-1)`
    // instead of `scrollY`, and gate on an OnScrollChangeListener toggling
    // `swipeRefresh.isEnabled` dynamically.
    private fun setupSwipeRefresh() {
        swipeRefresh.isEnabled = false
    }

    // ─── Cache busting on app upgrade ───
    //
    // Wipes WebView's HTTP cache the first time a new app version runs.
    // localStorage and cookies are PRESERVED (no session loss).
    // Tracked in regular SharedPreferences (not encrypted — non-sensitive).
    private fun clearCacheOnVersionBump() {
        val prefs = getSharedPreferences("suttro_app_meta", MODE_PRIVATE)
        val lastSeenVersion = prefs.getInt("last_webview_cache_version", -1)
        val currentVersion = try {
            packageManager.getPackageInfo(packageName, 0).longVersionCode.toInt()
        } catch (_: Exception) { 0 }

        if (lastSeenVersion != currentVersion) {
            Log.i("Suttro", "App version bumped ($lastSeenVersion -> $currentVersion); clearing WebView cache")
            webView.clearCache(true)
            prefs.edit().putInt("last_webview_cache_version", currentVersion).apply()
        }
    }

    // ─── WebView Setup (all features integrated) ───

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Chrome DevTools remote debugging — chrome://inspect to attach.
        // Enabled for both debug and release builds so we can diagnose
        // production-only flows (bKash, Google Sign-In) on real devices.
        WebView.setWebContentsDebuggingEnabled(true)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        @Suppress("DEPRECATION")
        settings.databaseEnabled = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.setSupportZoom(false)

        // ═══ FIX: Nested scrolling for SwipeRefreshLayout compatibility ═══
        // Without this, vertical scroll inside WebView is intercepted by SwipeRefresh
        // on long pages with many items (simulations, classes, daily). #scroll-bug
        webView.isNestedScrollingEnabled = true
        webView.overScrollMode = android.view.View.OVER_SCROLL_IF_CONTENT_SCROLLS
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false

        // ═══ Cache strategy ═══
        // LOAD_DEFAULT honors HTTP cache headers. But suttro.app sends
        // `Cache-Control: stale-while-revalidate=31535940` (1 year), which
        // makes WebView serve stale HTML for up to a year. Stale HTML
        // references stale CSS/JS bundle URLs (Next.js content-hash filenames),
        // so even a fresh deploy is invisible to the WebView until the user
        // manually clears app cache. That just bit us with the scroll bug:
        // CSS fix was live on the server but old CSS kept loading from cache.
        //
        // Fix: clear WebView cache once per app version bump. The HTTP cache
        // is rebuilt on next load (cheap) and CSS/JS bundles still cache
        // normally inside that fresh session.
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        clearCacheOnVersionBump()

        // User agent
        val defaultUA = settings.userAgentString
        settings.userAgentString = "$defaultUA ${SuttroConfig.USER_AGENT_SUFFIX}"

        // Force light mode — no dark mode
        try {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
                WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, false)
            }
        } catch (_: Exception) { }

        // Cookies
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        // JavaScript bridge (with title + badge callbacks)
        val bridge = SuttroBridge(
            sessionManager = sessionManager,
            onPageChanged = { path -> runOnUiThread { onWebPageChanged(path) } },
            onLogout = { runOnUiThread { handleLogout() } },
            onReady = { runOnUiThread { progressBar.visibility = View.GONE } },
            onTitleUpdate = { title -> runOnUiThread { onDynamicTitleUpdate(title) } },
            onBadgeUpdate = { count -> runOnUiThread { updateBadgeCount(count) } }
        )
        webView.addJavascriptInterface(bridge, SuttroBridge.INTERFACE_NAME)

        // Multi-window support (for target="_blank" links — PDFs, external previews)
        settings.setSupportMultipleWindows(true)
        settings.javaScriptCanOpenWindowsAutomatically = true

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                val url = uri.toString()
                val host = uri.host?.lowercase() ?: ""
                val scheme = uri.scheme?.lowercase() ?: ""
                val isRedirect = request.isRedirect
                val mainFrame = request.isForMainFrame

                Log.i("SuttroNav", "shouldOverride url=$url host=$host scheme=$scheme mainFrame=$mainFrame redirect=$isRedirect")

                // Logout redirect — must match ONLY the bare /login route (not
                // /login-help, /payment/success?next=suttro.app/login, etc). This
                // bug would route any URL containing "suttro.app/login" to logout.
                if ((scheme == "https" || scheme == "http") &&
                    host == "suttro.app" &&
                    (uri.path == "/login" || uri.path?.startsWith("/login/") == true)
                ) {
                    Log.i("SuttroNav", "→ handleLogout()")
                    handleLogout()
                    return true
                }

                // Telephone / email / SMS / market — let the system handle
                if (scheme in setOf("tel", "mailto", "sms", "market", "intent")) {
                    Log.i("SuttroNav", "→ system intent for scheme=$scheme")
                    try { startActivity(Intent(Intent.ACTION_VIEW, uri)) } catch (_: Exception) {}
                    return true
                }

                // Hosts allowed to load INSIDE WebView (bKash + Google Drive for PDFs + YouTube + OAuth)
                if (isInAppHost(host)) {
                    Log.i("SuttroNav", "→ STAY in-app (whitelisted host)")
                    return false
                }

                // Empty host with http(s) scheme → likely a relative URL or
                // malformed — don't punt to external, let WebView handle it.
                if ((scheme == "https" || scheme == "http") && host.isEmpty()) {
                    Log.w("SuttroNav", "→ STAY in-app (http(s) with empty host — not punting)")
                    return false
                }

                // Truly external — open in system browser
                Log.w("SuttroNav", "→ EXTERNAL browser (host=$host not whitelisted)")
                try { startActivity(Intent(Intent.ACTION_VIEW, uri)) } catch (_: Exception) {}
                return true
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                Log.i("SuttroNav", "onPageStarted url=$url")
                progressBar.visibility = View.VISIBLE
                if (isFirstLoad) {
                    showShimmer()
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                Log.i("SuttroNav", "onPageFinished url=$url")
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
                hideShimmer()
                isFirstLoad = false
                CookieManager.getInstance().flush()

                if (url?.contains("suttro.app") == true) {
                    hideWebNavigation(view)
                    if (!sessionInjected) {
                        injectSession(view)
                    }
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress >= 100) {
                    progressBar.visibility = View.GONE
                    swipeRefresh.isRefreshing = false
                }
            }

            // ═══ File input support — <input type="file"> ═══
            override fun onShowFileChooser(
                webView: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                params: FileChooserParams?
            ): Boolean {
                // Release any stale callback first
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback

                try {
                    val contentIntent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                    }
                    contentIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

                    val acceptTypes = params?.acceptTypes?.toList() ?: emptyList()
                    val wantsImage = acceptTypes.isEmpty() ||
                        acceptTypes.any { it.startsWith("image/") || it == "*/*" || it.contains("image") }

                    // Add camera capture as extra option when images are acceptable
                    val extraIntents = mutableListOf<Intent>()
                    if (wantsImage) {
                        try {
                            val imageFile = File.createTempFile("camera_", ".jpg", cacheDir)
                            cameraPhotoUri = FileProvider.getUriForFile(
                                this@MainContainerActivity,
                                "${applicationContext.packageName}.fileprovider",
                                imageFile
                            )
                            val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                                putExtra(MediaStore.EXTRA_OUTPUT, cameraPhotoUri)
                                addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            }
                            extraIntents.add(cameraIntent)
                        } catch (e: Exception) {
                            Log.w("FileChooser", "Camera intent unavailable", e)
                        }
                    }

                    val chooser = Intent(Intent.ACTION_CHOOSER).apply {
                        putExtra(Intent.EXTRA_INTENT, contentIntent)
                        putExtra(Intent.EXTRA_TITLE, "ফাইল বাছাই করো")
                        if (extraIntents.isNotEmpty()) {
                            putExtra(Intent.EXTRA_INITIAL_INTENTS, extraIntents.toTypedArray())
                        }
                    }

                    fileChooserLauncher.launch(chooser)
                    return true
                } catch (e: Exception) {
                    Log.e("FileChooser", "Failed to launch file chooser", e)
                    filePathCallback = null
                    cameraPhotoUri = null
                    Toast.makeText(
                        this@MainContainerActivity,
                        "ফাইল বাছাইকারী খুলতে সমস্যা হয়েছে",
                        Toast.LENGTH_SHORT
                    ).show()
                    return false
                }
            }

            // ═══ target="_blank" / window.open() → keep navigation in the MAIN WebView ═══
            // Why this approach: `shouldOverrideUrlLoading` does NOT fire for the initial
            // load on a freshly-created popup WebView, so routing through a throwaway WebView
            // loses the URL (the page loads silently in an invisible WebView, and on some
            // Android builds the system then falls back to launching the external browser —
            // this is exactly what broke the bKash success redirect).
            //
            // Safer pattern: hand the popup request to the main WebView. Its own
            // `shouldOverrideUrlLoading` (above) already handles external-host punting and
            // in-app navigation identically, so the user stays inside the app for all
            // whitelisted hosts (suttro.app, bKash, Google Drive, YouTube, OAuth).
            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                Log.i("SuttroNav", "onCreateWindow dialog=$isDialog userGesture=$isUserGesture currentUrl=${view?.url}")
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                if (transport == null) {
                    Log.w("SuttroNav", "onCreateWindow: transport null — dropping popup")
                    return false
                }
                transport.webView = webView
                resultMsg.sendToTarget()
                return true
            }

            // ═══ Permission request (camera/mic for WebRTC) ═══
            override fun onPermissionRequest(request: PermissionRequest?) {
                request ?: return
                runOnUiThread {
                    val resources = request.resources ?: emptyArray()
                    if (resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                        if (ContextCompat.checkSelfPermission(this@MainContainerActivity, Manifest.permission.CAMERA)
                            == PackageManager.PERMISSION_GRANTED
                        ) {
                            request.grant(resources)
                        } else {
                            pendingCameraRequest = request
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    } else {
                        // Grant non-camera resources (mic etc.) directly — DOMStorage/MidiSysex not sensitive here
                        request.grant(resources)
                    }
                }
            }
        }
    }

    /**
     * Hosts allowed to load INSIDE the WebView rather than being punted to the system browser.
     * Covers:
     *  - suttro.app itself
     *  - bKash payment flow
     *  - Google Drive URLs (PDF preview + image serving from uploaded homework)
     *  - YouTube embeds
     *  - Google OAuth redirects
     */
    private fun isInAppHost(host: String): Boolean {
        if (host.isEmpty()) return false
        val inAppSuffixes = listOf(
            // Suttro
            "suttro.app",
            // bKash
            "bkash.com",
            "bka.sh",
            // Google Drive / preview / CDN
            "drive.google.com",
            "docs.google.com",
            "googleusercontent.com",
            // YouTube
            "youtube.com",
            "youtu.be",
            "youtube-nocookie.com",
            "ytimg.com",
            // Google OAuth
            "accounts.google.com",
            "google.com"
        )
        return inAppSuffixes.any { host == it || host.endsWith(".$it") }
    }

    private fun hideWebNavigation(view: WebView?) {
        view?.evaluateJavascript("""
            (function() {
                if (window.__suttroNativeSetup) return;
                window.__suttroNativeSetup = true;

                // 1. Hide web AppBar & BottomNav via CSS
                var style = document.createElement('style');
                style.id = 'suttro-native-hide';
                style.textContent = [
                    'header.sticky.top-0.lg\\:hidden { display: none !important; }',
                    'nav.fixed.bottom-0.lg\\:hidden { display: none !important; }',
                    'main { padding-bottom: 0 !important; }'
                ].join('\n');
                document.head.appendChild(style);

                // 2. Monitor SPA route changes
                function checkRoute() {
                    var path = window.location.pathname;
                    if (path === '/login' && window.SuttroBridge) {
                        window.SuttroBridge.logout();
                        return;
                    }
                    if (window.SuttroBridge) {
                        window.SuttroBridge.onPageChanged(path);
                    }
                }
                var origPush = history.pushState;
                var origReplace = history.replaceState;
                history.pushState = function() {
                    origPush.apply(this, arguments);
                    checkRoute();
                };
                history.replaceState = function() {
                    origReplace.apply(this, arguments);
                    checkRoute();
                };
                window.addEventListener('popstate', checkRoute);

                // 3. Dynamic title observer (#7)
                var titleEl = document.querySelector('title');
                if (titleEl && window.SuttroBridge) {
                    new MutationObserver(function() {
                        var t = document.title || '';
                        if (t && t !== 'সূত্র') {
                            window.SuttroBridge.updateTitle(t);
                        }
                    }).observe(titleEl, { childList: true, characterData: true, subtree: true });
                }

                checkRoute();
            })();
        """.trimIndent(), null)
    }

    private fun injectSession(view: WebView?) {
        val sessionJson = sessionManager.getSessionJson() ?: return
        val escaped = sessionJson
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("'", "\\'")
            .replace("\n", "\\n")
        val key = SuttroConfig.SUPABASE_STORAGE_KEY

        view?.evaluateJavascript("""
            (function() {
                var key = '$key';
                var existing = localStorage.getItem(key);
                if (!existing || existing.indexOf('access_token') === -1) {
                    localStorage.setItem(key, "$escaped");
                    localStorage.setItem('suttro_onboarding_done', 'true');
                    window.location.reload();
                    return 'injected';
                }
                return 'exists';
            })();
        """.trimIndent()) { result ->
            sessionInjected = true
        }
    }

    // ─── SPA Navigation (#10 — avoid full page reload) ───

    private fun navigateSPA(path: String) {
        currentPath = path
        updateToolbarForPath(path)
        if (sessionInjected) {
            // Use Next.js router for instant SPA navigation
            webView.evaluateJavascript("""
                (function() {
                    if (window.__next && window.__next.router) {
                        window.__next.router.push('$path');
                    } else if (window.next && window.next.router) {
                        window.next.router.push('$path');
                    } else {
                        window.location.href = '${SuttroConfig.WEB_URL}$path';
                    }
                })();
            """.trimIndent(), null)
        } else {
            loadPath(path)
        }
    }

    private fun loadPath(path: String) {
        currentPath = path
        webView.loadUrl("${SuttroConfig.WEB_URL}$path")
    }

    // ─── Bottom Nav (#1 animated icons + #8 haptic) ───

    private fun setupBottomNav() {
        bottomNav.setOnItemSelectedListener { item ->
            // Haptic feedback (#8)
            bottomNav.performHapticFeedback(
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
                    HapticFeedbackConstants.SEGMENT_FREQUENT_TICK
                else
                    HapticFeedbackConstants.KEYBOARD_TAP
            )

            // Bounce animation on selected tab icon (#1)
            animateTabIcon(item.itemId)

            val path = tabPaths[item.itemId] ?: "/"
            isNavigatingFromTab = true
            navigateSPA(path)
            updateToolbarForPath(path)
            true
        }
    }

    /** Bounce/scale animation on the selected tab icon */
    private fun animateTabIcon(itemId: Int) {
        val menuView = bottomNav.getChildAt(0) as? android.view.ViewGroup ?: return
        for (i in 0 until menuView.childCount) {
            val itemView = menuView.getChildAt(i)
            // Find the matching item
            if (itemView is android.view.ViewGroup) {
                val navItemId = bottomNav.menu.getItem(i).itemId
                if (navItemId == itemId) {
                    // Scale down then bounce up
                    itemView.animate()
                        .scaleX(0.8f).scaleY(0.8f)
                        .setDuration(100)
                        .withEndAction {
                            itemView.animate()
                                .scaleX(1f).scaleY(1f)
                                .setDuration(300)
                                .setInterpolator(OvershootInterpolator(2f))
                                .start()
                        }
                        .start()
                    break
                }
            }
        }
    }

    // ─── Back Navigation ───

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    // ─── Toolbar Title Logic (#7 sub-page accuracy) ───

    private fun updateToolbarForPath(path: String) {
        if (path == "/") {
            showHomeToolbar()
        } else {
            val tabTitle = tabTitles[path]
            if (tabTitle != null) {
                showPageToolbar(tabTitle)
            } else {
                showPageToolbar(getSubPageTitle(path))
            }
        }
    }

    private fun getSubPageTitle(path: String): String {
        subPageTitles[path]?.let { return it }
        return when {
            path.startsWith("/sim/") -> "সিমুলেশন"
            path.startsWith("/exam/") -> "পরীক্ষা"
            path.startsWith("/class/") -> "ক্লাস"
            path.startsWith("/guide/") -> "গাইড"
            path.startsWith("/practice/") -> "অনুশীলন"
            path.startsWith("/cq/") -> "সৃজনশীল প্রশ্ন"
            path.startsWith("/daily") -> "আজকের পড়া"
            else -> "সূত্র"
        }
    }

    /** Called by SuttroBridge.updateTitle() — dynamic title from web (#7) */
    private fun onDynamicTitleUpdate(title: String) {
        if (currentPath != "/" && title.isNotBlank()) {
            // Only override if not a main tab (those have fixed Bengali titles)
            val isTabPage = tabTitles.containsKey(currentPath)
            if (!isTabPage) {
                toolbarTitle.text = title.replace(" | সূত্র", "").replace(" - সূত্র", "").trim()
            }
        }
    }

    private fun onWebPageChanged(path: String) {
        currentPath = path
        updateToolbarForPath(path)

        // Sync bottom nav without triggering listener
        val tabId = tabPaths.entries.find { (_, p) ->
            if (p == "/") path == "/" else path.startsWith(p)
        }?.key
        if (tabId != null && !isNavigatingFromTab) {
            bottomNav.menu.findItem(tabId)?.isChecked = true
        }
        isNavigatingFromTab = false

        // Immersive pages — hide nav
        val hideNav = path.startsWith("/sim/") || path.startsWith("/class/") || path.startsWith("/exam/")
        bottomNav.visibility = if (hideNav) View.GONE else View.VISIBLE
        toolbarContainer.visibility = if (path.startsWith("/sim/")) View.GONE else View.VISIBLE

        // Disable swipe-refresh on immersive pages (#9)
        swipeRefresh.isEnabled = !hideNav
    }

    // ─── Logout ───

    private fun handleLogout() {
        sessionManager.clearSession()
        sessionManager.isOnboardingDone = false
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
}
