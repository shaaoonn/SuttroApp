package app.suttro.suttro

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.google.gson.JsonParser

class SessionManager(context: Context) {

    private val prefs: SharedPreferences

    init {
        val masterKey = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        prefs = EncryptedSharedPreferences.create(
            "suttro_session",
            masterKey,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveSession(sessionJson: String) {
        prefs.edit()
            .putString(KEY_SESSION, sessionJson)
            .apply()
    }

    fun getSessionJson(): String? = prefs.getString(KEY_SESSION, null)

    fun getAccessToken(): String? {
        val json = getSessionJson() ?: return null
        return try {
            JsonParser.parseString(json).asJsonObject.get("access_token")?.asString
        } catch (e: Exception) {
            null
        }
    }

    fun getRefreshToken(): String? {
        val json = getSessionJson() ?: return null
        return try {
            JsonParser.parseString(json).asJsonObject.get("refresh_token")?.asString
        } catch (e: Exception) {
            null
        }
    }

    fun getUserName(): String? {
        val json = getSessionJson() ?: return null
        return try {
            val user = JsonParser.parseString(json).asJsonObject.getAsJsonObject("user")
            val meta = user?.getAsJsonObject("user_metadata")
            meta?.get("full_name")?.asString ?: meta?.get("name")?.asString
        } catch (e: Exception) {
            null
        }
    }

    fun getUserAvatarUrl(): String? {
        val json = getSessionJson() ?: return null
        return try {
            val user = JsonParser.parseString(json).asJsonObject.getAsJsonObject("user")
            val meta = user?.getAsJsonObject("user_metadata")
            meta?.get("avatar_url")?.asString ?: meta?.get("picture")?.asString
        } catch (e: Exception) {
            null
        }
    }

    fun hasSession(): Boolean = getAccessToken() != null

    fun clearSession() {
        prefs.edit().remove(KEY_SESSION).apply()
    }

    var isOnboardingDone: Boolean
        get() = prefs.getBoolean(KEY_ONBOARDING, false)
        set(value) = prefs.edit().putBoolean(KEY_ONBOARDING, value).apply()

    companion object {
        private const val KEY_SESSION = "session_data"
        private const val KEY_ONBOARDING = "onboarding_done"
    }
}
