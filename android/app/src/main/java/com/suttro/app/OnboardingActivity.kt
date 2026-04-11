package com.suttro.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.card.MaterialCardView
import com.suttro.app.util.SupabaseApi
import kotlinx.coroutines.launch

class OnboardingActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager
    private val api = SupabaseApi()

    private lateinit var nameInput: EditText
    private lateinit var card9: MaterialCardView
    private lateinit var card10: MaterialCardView
    private lateinit var label9: TextView
    private lateinit var label10: TextView
    private lateinit var submitBtn: Button
    private lateinit var errorText: TextView
    private lateinit var progressBar: ProgressBar

    private var selectedClass = 9

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_onboarding)

        sessionManager = SessionManager(this)

        nameInput = findViewById(R.id.name_input)
        card9 = findViewById(R.id.card_class9)
        card10 = findViewById(R.id.card_class10)
        label9 = findViewById(R.id.label_class9)
        label10 = findViewById(R.id.label_class10)
        submitBtn = findViewById(R.id.btn_submit)
        errorText = findViewById(R.id.error_text)
        progressBar = findViewById(R.id.progress_bar)

        // Pre-fill name from Google metadata
        val googleName = sessionManager.getUserName()
        if (!googleName.isNullOrBlank()) {
            nameInput.setText(googleName)
        }

        updateClassSelection()

        card9.setOnClickListener {
            selectedClass = 9
            updateClassSelection()
        }
        card10.setOnClickListener {
            selectedClass = 10
            updateClassSelection()
        }
        submitBtn.setOnClickListener { handleSubmit() }
    }

    private fun updateClassSelection() {
        val selectedColor = getColor(R.color.colorPrimary)
        val unselectedColor = getColor(R.color.text_muted)
        val selectedBg = getColor(R.color.bg_teal_light)
        val whiteBg = getColor(android.R.color.white)

        card9.strokeColor = if (selectedClass == 9) selectedColor else getColor(R.color.border_light)
        card9.setCardBackgroundColor(if (selectedClass == 9) selectedBg else whiteBg)
        label9.setTextColor(if (selectedClass == 9) selectedColor else unselectedColor)

        card10.strokeColor = if (selectedClass == 10) selectedColor else getColor(R.color.border_light)
        card10.setCardBackgroundColor(if (selectedClass == 10) selectedBg else whiteBg)
        label10.setTextColor(if (selectedClass == 10) selectedColor else unselectedColor)
    }

    private fun handleSubmit() {
        val name = nameInput.text.toString().trim()
        if (name.isEmpty()) {
            showError("তোমার নাম লেখো")
            return
        }

        val token = sessionManager.getAccessToken()
        if (token == null) {
            showError("সেশন শেষ — আবার লগ ইন করো")
            return
        }

        setLoading(true)
        errorText.visibility = View.GONE

        lifecycleScope.launch {
            api.updateProfile(token, name, selectedClass).fold(
                onSuccess = {
                    sessionManager.isOnboardingDone = true
                    setLoading(false)
                    startActivity(Intent(this@OnboardingActivity, MainContainerActivity::class.java))
                    finish()
                },
                onFailure = { e ->
                    setLoading(false)
                    showError(e.message ?: "প্রোফাইল আপডেট করা যায়নি")
                }
            )
        }
    }

    private fun showError(msg: String) {
        errorText.text = msg
        errorText.visibility = View.VISIBLE
    }

    private fun setLoading(loading: Boolean) {
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        submitBtn.isEnabled = !loading
    }
}
