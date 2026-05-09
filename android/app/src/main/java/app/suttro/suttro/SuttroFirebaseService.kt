package app.suttro.suttro

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class SuttroFirebaseService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "SuttroFCM"
        private const val CHANNEL_ID_GENERAL = "suttro_general"
        private const val CHANNEL_ID_CLASS = "suttro_new_class"
        private const val CHANNEL_ID_EXAM = "suttro_exam"
        private const val CHANNEL_ID_DAILY = "suttro_daily_lesson"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    /**
     * Called when a new FCM token is generated (first launch or token refresh).
     * Sends the token to our backend so we can target this device.
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        sendTokenToServer(token)
    }

    /**
     * Called when a message is received while the app is in the foreground.
     * For background messages, the system tray handles notification display automatically.
     */
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d(TAG, "Message from: ${message.from}")

        // Check for data payload (custom data from our server)
        val data = message.data
        val title = data["title"] ?: message.notification?.title ?: "সূত্র"
        val body = data["body"] ?: message.notification?.body ?: ""
        val type = data["type"] ?: "general"  // class, exam, daily, general
        val path = data["path"] ?: "/"         // deep link path

        showNotification(title, body, type, path)
    }

    /**
     * Build and display a local notification.
     */
    private fun showNotification(title: String, body: String, type: String, path: String) {
        val channelId = when (type) {
            "class" -> CHANNEL_ID_CLASS
            "exam" -> CHANNEL_ID_EXAM
            "daily" -> CHANNEL_ID_DAILY
            else -> CHANNEL_ID_GENERAL
        }

        // Create intent to open the app at the specified path
        val intent = Intent(this, MainContainerActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("deep_link_path", path)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, System.currentTimeMillis().toInt(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(System.currentTimeMillis().toInt(), notification)
    }

    /**
     * Create notification channels (Android 8.0+).
     * Each channel can be independently controlled by the user in Settings.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val channels = listOf(
                NotificationChannel(
                    CHANNEL_ID_GENERAL,
                    "সাধারণ বিজ্ঞপ্তি",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply { description = "সূত্র থেকে সাধারণ আপডেট" },

                NotificationChannel(
                    CHANNEL_ID_CLASS,
                    "নতুন ক্লাস",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply { description = "নতুন ভিডিও ক্লাস আপলোড হলে জানাবে" },

                NotificationChannel(
                    CHANNEL_ID_EXAM,
                    "পরীক্ষা",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply { description = "নতুন পরীক্ষা ও রেজাল্ট" },

                NotificationChannel(
                    CHANNEL_ID_DAILY,
                    "আজকের পড়া",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply { description = "প্রতিদিনের পড়ার রিমাইন্ডার" }
            )

            channels.forEach { manager.createNotificationChannel(it) }
        }
    }

    /**
     * Send the FCM token to our Supabase backend.
     */
    private fun sendTokenToServer(token: String) {
        val sessionManager = SessionManager(this)
        val accessToken = sessionManager.getAccessToken() ?: return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val json = """{"fcm_token": "$token"}""".trimIndent()
                val body = json.toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${SuttroConfig.BASE_URL}/api/push-token")
                    .addHeader("Authorization", "Bearer $accessToken")
                    .post(body)
                    .build()

                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    Log.d(TAG, "FCM token sent to server successfully")
                } else {
                    Log.e(TAG, "Failed to send FCM token: ${response.code}")
                }
                response.close()
            } catch (e: Exception) {
                Log.e(TAG, "Error sending FCM token", e)
            }
        }
    }
}
