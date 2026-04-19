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
    private lateinit var phoneInput: EditText
    private lateinit var card9: MaterialCardView
    private lateinit var card10: MaterialCardView
    private lateinit var label9: TextView
    private lateinit var label10: TextView
    private lateinit var num9: TextView
    private lateinit var num10: TextView
    private lateinit var cardScience: MaterialCardView
    private lateinit var cardHumanities: MaterialCardView
    private lateinit var cardCommerce: MaterialCardView
    private lateinit var labelScience: TextView
    private lateinit var labelHumanities: TextView
    private lateinit var labelCommerce: TextView
    private lateinit var submitBtn: Button
    private lateinit var errorText: TextView
    private lateinit var progressBar: ProgressBar

    private var selectedClass = 9
    private var selectedDepartment = "science"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_onboarding)

        sessionManager = SessionManager(this)

        nameInput = findViewById(R.id.name_input)
        phoneInput = findViewById(R.id.phone_input)
        card9 = findViewById(R.id.card_class9)
        card10 = findViewById(R.id.card_class10)
        label9 = findViewById(R.id.label_class9)
        label10 = findViewById(R.id.label_class10)
        num9 = findViewById(R.id.num_class9)
        num10 = findViewById(R.id.num_class10)
        cardScience = findViewById(R.id.card_science)
        cardHumanities = findViewById(R.id.card_humanities)
        cardCommerce = findViewById(R.id.card_commerce)
        labelScience = findViewById(R.id.label_science)
        labelHumanities = findViewById(R.id.label_humanities)
        labelCommerce = findViewById(R.id.label_commerce)
        submitBtn = findViewById(R.id.btn_submit)
        errorText = findViewById(R.id.error_text)
        progressBar = findViewById(R.id.progress_bar)

        // Pre-fill name from Google metadata
        val googleName = sessionManager.getUserName()
        if (!googleName.isNullOrBlank()) {
            nameInput.setText(googleName)
        }

        updateClassSelection()
        updateDepartmentSelection()

        card9.setOnClickListener {
            selectedClass = 9
            updateClassSelection()
        }
        card10.setOnClickListener {
            selectedClass = 10
            updateClassSelection()
        }
        cardScience.setOnClickListener {
            selectedDepartment = "science"
            updateDepartmentSelection()
        }
        cardHumanities.setOnClickListener {
            selectedDepartment = "humanities"
            updateDepartmentSelection()
        }
        cardCommerce.setOnClickListener {
            selectedDepartment = "commerce"
            updateDepartmentSelection()
        }
        submitBtn.setOnClickListener { handleSubmit() }
    }

    private fun updateClassSelection() {
        val selectedColor = getColor(R.color.colorPrimary)
        val unselectedColor = getColor(R.color.text_muted)
        val selectedBg = getColor(R.color.bg_teal_light)
        val whiteBg = getColor(android.R.color.white)
        val borderColor = getColor(R.color.border_light)

        card9.strokeColor = if (selectedClass == 9) selectedColor else borderColor
        card9.setCardBackgroundColor(if (selectedClass == 9) selectedBg else whiteBg)
        num9.setTextColor(if (selectedClass == 9) selectedColor else unselectedColor)
        label9.setTextColor(if (selectedClass == 9) selectedColor else unselectedColor)

        card10.strokeColor = if (selectedClass == 10) selectedColor else borderColor
        card10.setCardBackgroundColor(if (selectedClass == 10) selectedBg else whiteBg)
        num10.setTextColor(if (selectedClass == 10) selectedColor else unselectedColor)
        label10.setTextColor(if (selectedClass == 10) selectedColor else unselectedColor)
    }

    private fun updateDepartmentSelection() {
        val selectedColor = getColor(R.color.colorPrimary)
        val unselectedColor = getColor(R.color.text_muted)
        val selectedBg = getColor(R.color.bg_teal_light)
        val whiteBg = getColor(android.R.color.white)
        val borderColor = getColor(R.color.border_light)

        val cards = mapOf(
            "science" to Triple(cardScience, labelScience, null as TextView?),
            "humanities" to Triple(cardHumanities, labelHumanities, null as TextView?),
            "commerce" to Triple(cardCommerce, labelCommerce, null as TextView?),
        )

        for ((key, pair) in cards) {
            val (card, label, _) = pair
            val isSelected = selectedDepartment == key
            card.strokeColor = if (isSelected) selectedColor else borderColor
            card.setCardBackgroundColor(if (isSelected) selectedBg else whiteBg)
            label.setTextColor(if (isSelected) selectedColor else unselectedColor)
        }
    }

    private fun handleSubmit() {
        val name = nameInput.text.toString().trim()
        if (name.isEmpty()) {
            showError("তোমার নাম লেখো")
            return
        }

        // Phone is optional - if provided, must be valid
        val rawPhone = phoneInput.text.toString().replace(Regex("\\D"), "")
        if (rawPhone.isNotEmpty() && rawPhone.length < 10) {
            showError("সঠিক মোবাইল নম্বর দাও (১১ সংখ্যা)")
            return
        }
        val fullPhone: String? = if (rawPhone.isNotEmpty()) "+880${rawPhone.trimStart('0')}" else null

        val token = sessionManager.getAccessToken()
        if (token == null) {
            showError("সেশন শেষ - আবার লগ ইন করো")
            return
        }

        setLoading(true)
        errorText.visibility = View.GONE

        lifecycleScope.launch {
            api.updateProfile(token, name, selectedClass, fullPhone, selectedDepartment).fold(
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
