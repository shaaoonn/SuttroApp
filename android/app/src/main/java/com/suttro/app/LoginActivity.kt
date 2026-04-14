package com.suttro.app

import android.content.Intent
import android.os.Bundle
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
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.suttro.app.util.SupabaseApi
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

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

        val googleIdOption = GetGoogleIdOption.Builder()
            .setServerClientId(SuttroConfig.GOOGLE_WEB_CLIENT_ID)
            .setFilterByAuthorizedAccounts(false)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
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
                            showError(e.message ?: "Google লগইন ব্যর্থ")
                        }
                    )
                } else {
                    setLoading(false)
                    showError("Google লগইন ব্যর্থ")
                }
            } catch (e: Exception) {
                setLoading(false)
                val msg = e.message ?: e.javaClass.simpleName
                if (msg.contains("cancel", ignoreCase = true) ||
                    msg.contains("dismissed", ignoreCase = true)
                ) {
                    // User cancelled — no error shown
                } else if (msg.contains("no credentials", ignoreCase = true) ||
                    msg.contains("no accounts", ignoreCase = true)
                ) {
                    showError("Google অ্যাকাউন্ট পাওয়া যায়নি — সেটিংসে অ্যাকাউন্ট যোগ করো")
                } else {
                    showError("Google: $msg")
                }
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
