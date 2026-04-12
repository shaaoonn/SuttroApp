package com.suttro.app.util

import com.suttro.app.SuttroConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class SupabaseApi {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonType = "application/json; charset=utf-8".toMediaType()

    private fun buildRequest(endpoint: String, body: String): Request {
        return Request.Builder()
            .url("${SuttroConfig.SUPABASE_URL}$endpoint")
            .addHeader("apikey", SuttroConfig.SUPABASE_ANON_KEY)
            .addHeader("Content-Type", "application/json")
            .post(body.toRequestBody(jsonType))
            .build()
    }

    /**
     * Exchange Firebase ID token for Supabase session
     * Calls our Next.js API endpoint which verifies Firebase token
     * and returns Supabase session tokens
     */
    suspend fun exchangeFirebaseToken(firebaseIdToken: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val body = """{"firebase_token":"$firebaseIdToken"}"""
                val request = Request.Builder()
                    .url("${SuttroConfig.WEB_URL}/api/auth/firebase-exchange")
                    .addHeader("Content-Type", "application/json")
                    .post(body.toRequestBody(jsonType))
                    .build()
                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful && responseBody.contains("access_token")) {
                    Result.success(responseBody)
                } else {
                    Result.failure(Exception("[${response.code}] ${parseError(responseBody)}"))
                }
            } catch (e: Exception) {
                Result.failure(Exception("নেটওয়ার্ক: ${e.javaClass.simpleName}: ${e.message}"))
            }
        }

    /** Sign in with Google ID token and return raw session JSON */
    suspend fun signInWithGoogle(idToken: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val body = """{"provider":"google","id_token":"$idToken"}"""
            val request = buildRequest("/auth/v1/token?grant_type=id_token", body)
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            if (response.isSuccessful && responseBody.contains("access_token")) {
                Result.success(responseBody)
            } else {
                Result.failure(Exception("[${response.code}] ${parseError(responseBody)}"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Google API: ${e.javaClass.simpleName}: ${e.message}"))
        }
    }

    /** Refresh token and return new session JSON */
    suspend fun refreshToken(refreshToken: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val body = """{"refresh_token":"$refreshToken"}"""
            val request = buildRequest("/auth/v1/token?grant_type=refresh_token", body)
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            if (response.isSuccessful && responseBody.contains("access_token")) {
                Result.success(responseBody)
            } else {
                Result.failure(Exception(parseError(responseBody)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /** Update user profile (name + class_level) via Next.js API */
    suspend fun updateProfile(accessToken: String, name: String, classLevel: Int): Result<Unit> =
        withContext(Dispatchers.IO) {
            try {
                val body = """{"name":"$name","class_level":$classLevel}"""
                val request = Request.Builder()
                    .url("${SuttroConfig.WEB_URL}/api/profile")
                    .addHeader("Authorization", "Bearer $accessToken")
                    .addHeader("Content-Type", "application/json")
                    .patch(body.toRequestBody(jsonType))
                    .build()
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    Result.success(Unit)
                } else {
                    val errorBody = response.body?.string() ?: ""
                    Result.failure(Exception(parseError(errorBody)))
                }
            } catch (e: Exception) {
                Result.failure(Exception("প্রোফাইল আপডেট করা যায়নি"))
            }
        }

    private fun parseError(body: String): String {
        if (body.isBlank()) return "Empty response"
        return try {
            val json = com.google.gson.JsonParser.parseString(body).asJsonObject
            json.get("error_description")?.asString
                ?: json.get("error")?.asString
                ?: json.get("msg")?.asString
                ?: json.get("message")?.asString
                ?: body.take(300)
        } catch (e: Exception) {
            body.take(300)
        }
    }
}
