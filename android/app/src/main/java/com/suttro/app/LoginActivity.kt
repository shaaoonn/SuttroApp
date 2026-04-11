package com.suttro.app

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.HapticFeedbackConstants
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
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

    // Views — Phone step
    private lateinit var phoneSection: LinearLayout
    private lateinit var phoneInput: EditText
    private lateinit var sendOtpBtn: Button
    private lateinit var googleBtn: Button

    // Views — OTP step
    private lateinit var otpSection: LinearLayout
    private lateinit var otpPhoneLabel: TextView
    private lateinit var verifyBtn: Button
    private lateinit var resendBtn: TextView

    // OTP digit boxes
    private lateinit var otpBoxes: List<EditText>

    // Shared
    private lateinit var errorText: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var rootView: View

    private var fullPhone = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        sessionManager = SessionManager(this)
        rootView = findViewById(R.id.login_root)

        // Phone step views
        phoneSection = findViewById(R.id.phone_section)
        phoneInput = findViewById(R.id.phone_input)
        sendOtpBtn = findViewById(R.id.btn_send_otp)
        googleBtn = findViewById(R.id.btn_google)

        // OTP step views
        otpSection = findViewById(R.id.otp_section)
        otpPhoneLabel = findViewById(R.id.otp_phone_label)
        verifyBtn = findViewById(R.id.btn_verify)
        resendBtn = findViewById(R.id.btn_resend)

        // OTP digit boxes
        otpBoxes = listOf(
            findViewById(R.id.otp_1),
            findViewById(R.id.otp_2),
            findViewById(R.id.otp_3),
            findViewById(R.id.otp_4),
            findViewById(R.id.otp_5),
            findViewById(R.id.otp_6)
        )

        // Shared views
        errorText = findViewById(R.id.error_text)
        progressBar = findViewById(R.id.progress_bar)

        setupListeners()
        setupOtpBoxes()
    }

    private fun setupListeners() {
        sendOtpBtn.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
            handleSendOtp()
        }
        verifyBtn.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
            handleVerifyOtp()
        }
        googleBtn.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
            handleGoogleSignIn()
        }
        resendBtn.setOnClickListener {
            otpSection.visibility = View.GONE
            phoneSection.visibility = View.VISIBLE
            clearOtpBoxes()
            hideError()
        }
    }

    // ─── OTP Digit Boxes (#4) ───

    private fun setupOtpBoxes() {
        for (i in otpBoxes.indices) {
            val box = otpBoxes[i]

            // Auto-advance on digit entry
            box.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    val text = s?.toString() ?: ""
                    if (text.length == 1) {
                        // Update box visual
                        box.setBackgroundResource(R.drawable.bg_otp_box_filled)
                        box.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                        // Move to next box
                        if (i < otpBoxes.size - 1) {
                            otpBoxes[i + 1].requestFocus()
                        } else {
                            // Last box filled — auto verify
                            box.clearFocus()
                            handleVerifyOtp()
                        }
                    } else if (text.isEmpty()) {
                        box.setBackgroundResource(R.drawable.bg_otp_box)
                    }
                }
            })

            // Handle backspace — move to previous box
            box.setOnKeyListener { _, keyCode, event ->
                if (keyCode == KeyEvent.KEYCODE_DEL && event.action == KeyEvent.ACTION_DOWN) {
                    if (box.text.isEmpty() && i > 0) {
                        otpBoxes[i - 1].setText("")
                        otpBoxes[i - 1].requestFocus()
                        return@setOnKeyListener true
                    }
                }
                false
            }

            // Focus visual
            box.setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus && box.text.isEmpty()) {
                    box.setBackgroundResource(R.drawable.bg_otp_box_focused)
                } else if (!hasFocus && box.text.isEmpty()) {
                    box.setBackgroundResource(R.drawable.bg_otp_box)
                }
            }
        }

        // Handle paste (6 digits pasted at once)
        otpBoxes[0].addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val text = s?.toString() ?: ""
                if (text.length > 1) {
                    // Pasted multi-digit — distribute across boxes
                    val digits = text.replace(Regex("\\D"), "").take(6)
                    otpBoxes[0].removeTextChangedListener(this)
                    for (j in digits.indices) {
                        otpBoxes[j].setText(digits[j].toString())
                        otpBoxes[j].setBackgroundResource(R.drawable.bg_otp_box_filled)
                    }
                    if (digits.length >= 6) {
                        otpBoxes[5].clearFocus()
                        handleVerifyOtp()
                    } else if (digits.isNotEmpty()) {
                        otpBoxes[digits.length.coerceAtMost(5)].requestFocus()
                    }
                    otpBoxes[0].addTextChangedListener(this)
                }
            }
        })
    }

    private fun getOtpFromBoxes(): String {
        return otpBoxes.joinToString("") { it.text.toString() }
    }

    private fun clearOtpBoxes() {
        otpBoxes.forEach {
            it.setText("")
            it.setBackgroundResource(R.drawable.bg_otp_box)
        }
    }

    // ─── Auth Handlers ───

    private fun handleSendOtp() {
        val raw = phoneInput.text.toString().replace(Regex("\\D"), "")
        if (raw.length < 10) {
            showError("সঠিক মোবাইল নম্বর দাও")
            rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
            return
        }
        fullPhone = "+880${raw.trimStart('0')}"
        setLoading(true)
        hideError()

        lifecycleScope.launch {
            api.sendOtp(fullPhone).fold(
                onSuccess = {
                    setLoading(false)
                    phoneSection.visibility = View.GONE
                    otpSection.visibility = View.VISIBLE
                    otpPhoneLabel.text = "$fullPhone নম্বরে কোড পাঠানো হয়েছে"
                    otpBoxes[0].requestFocus()
                },
                onFailure = { e ->
                    setLoading(false)
                    showError(e.message ?: "OTP পাঠানো যায়নি")
                    rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
                }
            )
        }
    }

    private fun handleVerifyOtp() {
        val otp = getOtpFromBoxes().replace(Regex("\\D"), "")
        if (otp.length < 6) {
            showError("৬ সংখ্যার OTP দাও")
            rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
            return
        }
        setLoading(true)
        hideError()

        lifecycleScope.launch {
            api.verifyOtp(fullPhone, otp).fold(
                onSuccess = { sessionJson ->
                    sessionManager.saveSession(sessionJson)
                    setLoading(false)
                    rootView.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                    navigateAfterLogin()
                },
                onFailure = { e ->
                    setLoading(false)
                    showError(e.message ?: "OTP যাচাই ব্যর্থ")
                    rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
                    clearOtpBoxes()
                    otpBoxes[0].requestFocus()
                }
            )
        }
    }

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
                    // User cancelled
                } else {
                    showError("Google: ${e.javaClass.simpleName}: $msg")
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
        sendOtpBtn.isEnabled = !loading
        verifyBtn.isEnabled = !loading
        googleBtn.isEnabled = !loading
    }
}
