package app.suttro.suttro

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.HapticFeedbackConstants
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CustomCredential
import androidx.lifecycle.lifecycleScope
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import app.suttro.suttro.util.SupabaseApi
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "SuttroLogin"
    }

    private lateinit var sessionManager: SessionManager
    private val api = SupabaseApi()

    private lateinit var googleBtn: Button
    private lateinit var errorText: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var rootView: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        sessionManager = SessionManager(this)
        rootView = findViewById(R.id.login_root)

        googleBtn = findViewById(R.id.btn_google)
        errorText = findViewById(R.id.error_text)
        progressBar = findViewById(R.id.progress_bar)

        googleBtn.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
            handleGoogleSignIn()
        }
    }

    // ─── Google Sign-In (Credential Manager) ───

    private fun handleGoogleSignIn() {
        setLoading(true)
        hideError()

        // Use GetSignInWithGoogleOption (button-flow API) instead of GetGoogleIdOption
        // (auto-sign-in API). The button flow always presents the account picker
        // bottom sheet, so it works correctly after sign-out — whereas the auto-sign-in
        // API can throw NoCredentialException after logout when the only account on
        // device has been previously authorized.
        val signInOption = GetSignInWithGoogleOption.Builder(SuttroConfig.GOOGLE_WEB_CLIENT_ID)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(signInOption)
            .build()

        val credentialManager = CredentialManager.create(this)

        lifecycleScope.launch {
            try {
                val response = credentialManager.getCredential(this@LoginActivity, request)
                val credential = response.credential
                if (credential is CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val googleCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    val idToken = googleCredential.idToken

                    api.signInWithGoogle(idToken).fold(
                        onSuccess = { sessionJson ->
                            sessionManager.saveSession(sessionJson)
                            setLoading(false)
                            rootView.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                            navigateAfterLogin()
                        },
                        onFailure = { e ->
                            setLoading(false)
                            Log.e(TAG, "Backend sign-in failed", e)
                            showError("লগইন সম্পন্ন হয়নি, একটু পরে আবার চেষ্টা করো")
                        }
                    )
                } else {
                    setLoading(false)
                    Log.w(TAG, "Unexpected credential type: ${credential::class.java.simpleName}")
                    showError("লগইন সম্পন্ন হয়নি, একটু পরে আবার চেষ্টা করো")
                }
            } catch (e: Exception) {
                setLoading(false)
                handleSignInException(e)
            }
        }
    }

    /**
     * Handles Credential Manager exceptions. Shows user-friendly Bangla messages
     * for known cases and falls back to generic retry guidance for everything else.
     *
     * Critical: NEVER show raw error messages to the user. Production builds may
     * legitimately encounter configuration mismatches (SHA-1 changes, OAuth client
     * misconfig) and exposing developer error codes confuses users and triggers
     * Play "Broken Functionality" rejections during review.
     */
    private fun handleSignInException(e: Exception) {
        val msg = e.message ?: ""
        val name = e.javaClass.simpleName

        // Always log full details for debugging via `adb logcat | grep SuttroLogin`
        Log.e(TAG, "Sign-In failed: $name / $msg", e)

        when {
            // User cancelled — no error UI, button stays usable
            msg.contains("cancel", ignoreCase = true) ||
            msg.contains("dismissed", ignoreCase = true) ||
            msg.contains("user closed", ignoreCase = true) -> {
                // silent — user intentionally backed out
            }

            // No Google account configured on the device
            msg.contains("no credentials", ignoreCase = true) ||
            msg.contains("no accounts", ignoreCase = true) ||
            msg.contains("no provider", ignoreCase = true) -> {
                showError("ফোনে Google অ্যাকাউন্ট পাওয়া যায়নি — Settings → Accounts থেকে যোগ করে আবার চেষ্টা করো")
            }

            // Network problems
            msg.contains("network", ignoreCase = true) ||
            msg.contains("timeout", ignoreCase = true) ||
            msg.contains("unable to resolve", ignoreCase = true) -> {
                showError("ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করো")
            }

            // Configuration / signing issue (covers [28444], "Developer console", error 10/16)
            // Code-wise these mean the app's signing certificate doesn't match the OAuth
            // client SHA-1. We never expose this to the user — looks like a routine retry.
            else -> {
                showError("লগইন সাময়িকভাবে সম্ভব হচ্ছে না, একটু পরে আবার চেষ্টা করো")
            }
        }
    }

    private fun navigateAfterLogin() {
        val target = if (sessionManager.isOnboardingDone) {
            MainContainerActivity::class.java
        } else {
            OnboardingActivity::class.java
        }
        startActivity(Intent(this, target))
        finish()
    }

    private fun showError(msg: String) {
        errorText.text = msg
        errorText.visibility = View.VISIBLE
    }

    private fun hideError() {
        errorText.visibility = View.GONE
    }

    private fun setLoading(loading: Boolean) {
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        googleBtn.isEnabled = !loading
    }
}
