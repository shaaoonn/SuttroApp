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
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import com.suttro.app.util.SupabaseApi
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class LoginActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager
    private val api = SupabaseApi()
    private val firebaseAuth = FirebaseAuth.getInstance()

    // Firebase Phone Auth
    private var verificationId: String? = null
    private var resendToken: PhoneAuthProvider.ForceResendingToken? = null

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
        firebaseAuth.setLanguageCode("bn") // Bengali
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

    // ─── OTP Digit Boxes ───

    private fun setupOtpBoxes() {
        for (i in otpBoxes.indices) {
            val box = otpBoxes[i]

            box.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    val text = s?.toString() ?: ""
                    if (text.length == 1) {
                        box.setBackgroundResource(R.drawable.bg_otp_box_filled)
                        box.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                        if (i < otpBoxes.size - 1) {
                            otpBoxes[i + 1].requestFocus()
                        } else {
                            box.clearFocus()
                            handleVerifyOtp()
                        }
                    } else if (text.isEmpty()) {
                        box.setBackgroundResource(R.drawable.bg_otp_box)
                    }
                }
            })

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

            box.setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus && box.text.isEmpty()) {
                    box.setBackgroundResource(R.drawable.bg_otp_box_focused)
                } else if (!hasFocus && box.text.isEmpty()) {
                    box.setBackgroundResource(R.drawable.bg_otp_box)
                }
            }
        }

        // Handle paste
        otpBoxes[0].addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val text = s?.toString() ?: ""
                if (text.length > 1) {
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

    // ─── Firebase Phone Auth ───

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

        val options = PhoneAuthOptions.newBuilder(firebaseAuth)
            .setPhoneNumber(fullPhone)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(this)
            .setCallbacks(object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                    // Auto-verification (e.g., auto SMS retrieval)
                    signInWithFirebaseCredential(credential)
                }

                override fun onVerificationFailed(e: FirebaseException) {
                    setLoading(false)
                    val msg = when {
                        e.message?.contains("invalid", ignoreCase = true) == true ->
                            "সঠিক ফোন নম্বর দাও"
                        e.message?.contains("quota", ignoreCase = true) == true ->
                            "আজকের SMS সীমা শেষ — কাল আবার চেষ্টা করো"
                        e.message?.contains("too-many", ignoreCase = true) == true ||
                        e.message?.contains("blocked", ignoreCase = true) == true ->
                            "অনেকবার চেষ্টা করেছো — কিছুক্ষণ পর আবার চেষ্টা করো"
                        else -> "OTP পাঠানো যায়নি: ${e.message}"
                    }
                    showError(msg)
                    rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
                }

                override fun onCodeSent(
                    vId: String,
                    token: PhoneAuthProvider.ForceResendingToken
                ) {
                    verificationId = vId
                    resendToken = token
                    setLoading(false)
                    phoneSection.visibility = View.GONE
                    otpSection.visibility = View.VISIBLE
                    otpPhoneLabel.text = "$fullPhone নম্বরে কোড পাঠানো হয়েছে"
                    otpBoxes[0].requestFocus()
                }
            })
            .build()

        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    private fun handleVerifyOtp() {
        val otp = getOtpFromBoxes().replace(Regex("\\D"), "")
        if (otp.length < 6) {
            showError("৬ সংখ্যার OTP দাও")
            rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
            return
        }
        val vId = verificationId
        if (vId == null) {
            showError("আগে OTP পাঠাও")
            return
        }
        setLoading(true)
        hideError()

        val credential = PhoneAuthProvider.getCredential(vId, otp)
        signInWithFirebaseCredential(credential)
    }

    private fun signInWithFirebaseCredential(credential: PhoneAuthCredential) {
        firebaseAuth.signInWithCredential(credential)
            .addOnSuccessListener { authResult ->
                // Get Firebase ID token, then exchange for Supabase session
                authResult.user?.getIdToken(true)?.addOnSuccessListener { tokenResult ->
                    val firebaseToken = tokenResult.token
                    if (firebaseToken != null) {
                        exchangeForSupabaseSession(firebaseToken)
                    } else {
                        setLoading(false)
                        showError("Firebase token পাওয়া যায়নি")
                    }
                }?.addOnFailureListener { e ->
                    setLoading(false)
                    showError("Token error: ${e.message}")
                }
            }
            .addOnFailureListener { e ->
                setLoading(false)
                val msg = when {
                    e.message?.contains("invalid", ignoreCase = true) == true ->
                        "ভুল OTP — আবার চেষ্টা করো"
                    e.message?.contains("expired", ignoreCase = true) == true ->
                        "OTP মেয়াদ শেষ — আবার পাঠাও"
                    else -> "OTP যাচাই ব্যর্থ: ${e.message}"
                }
                showError(msg)
                rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
                clearOtpBoxes()
                otpBoxes[0].requestFocus()
            }
    }

    private fun exchangeForSupabaseSession(firebaseToken: String) {
        lifecycleScope.launch {
            api.exchangeFirebaseToken(firebaseToken).fold(
                onSuccess = { sessionJson ->
                    sessionManager.saveSession(sessionJson)
                    setLoading(false)
                    rootView.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                    navigateAfterLogin()
                },
                onFailure = { e ->
                    setLoading(false)
                    showError(e.message ?: "লগইন করতে সমস্যা হয়েছে")
                    rootView.performHapticFeedback(HapticFeedbackConstants.REJECT)
                }
            )
        }
    }

    // ─── Google Sign-In ───

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
