# ─────────────────────────────────────────────
# Suttro App — ProGuard Rules
# ─────────────────────────────────────────────

# Keep app classes
-keep class com.suttro.app.** { *; }

# WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Credential Manager
-keep class androidx.credentials.** { *; }
-keep class com.google.android.libraries.identity.googleid.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keepattributes Signature

# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule { <init>(...); }
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** { **[] $VALUES; public *; }
-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder$InternalRewinder { *** rewind(); }
-dontwarn com.bumptech.glide.**

# Shimmer
-keep class com.facebook.shimmer.** { *; }

# SwipeRefreshLayout
-keep class androidx.swiperefreshlayout.** { *; }

# Material Design Components — inflated from XML (MaterialCardView, BottomNavigationView,
# TextInputLayout, MaterialButton, MaterialToolbar). R8 full-mode would strip these and
# crash on layout inflation. Must explicitly keep.
-keep class com.google.android.material.** { *; }
-keep interface com.google.android.material.** { *; }
-dontwarn com.google.android.material.**

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Keep WebView client classes
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
    public void *(android.webkit.WebView, java.lang.String);
}

# Kotlin coroutines (defensive — AAR ships rules but be safe)
-dontwarn kotlinx.coroutines.**
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Kotlin metadata — required if any class is accessed via Kotlin reflection (defensive)
-keep class kotlin.Metadata { *; }
-keepattributes RuntimeVisibleAnnotations,AnnotationDefault

# Activities/Services declared in AndroidManifest — already covered by com.suttro.app.**
# but make explicit for R8 full-mode safety
-keep class com.suttro.app.SplashActivity { *; }
-keep class com.suttro.app.LoginActivity { *; }
-keep class com.suttro.app.OnboardingActivity { *; }
-keep class com.suttro.app.MainContainerActivity { *; }
-keep class com.suttro.app.SuttroFirebaseService { *; }

# SuttroBridge — exposed to JavaScript, all public methods must survive obfuscation
-keep class com.suttro.app.SuttroBridge {
    public *;
}

# Don't warn about missing optional Firebase classes
-dontwarn com.google.firebase.analytics.connector.**
-dontwarn javax.annotation.**

# Preserve generic type info for reflective parsing (Gson JsonParser uses some)
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses
