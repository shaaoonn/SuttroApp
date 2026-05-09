package app.suttro.suttro

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

@SuppressLint("CustomSplashScreen")
class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        var isReady = false
        splashScreen.setKeepOnScreenCondition { !isReady }

        val session = SessionManager(this)

        val target = when {
            !session.hasSession() -> LoginActivity::class.java
            !session.isOnboardingDone -> OnboardingActivity::class.java
            else -> MainContainerActivity::class.java
        }

        isReady = true
        val targetIntent = Intent(this, target)

        // Forward deep link URI (#11)
        intent?.data?.let { uri ->
            if (target == MainContainerActivity::class.java) {
                targetIntent.data = uri
            }
        }

        startActivity(targetIntent)
        finish()
    }
}
