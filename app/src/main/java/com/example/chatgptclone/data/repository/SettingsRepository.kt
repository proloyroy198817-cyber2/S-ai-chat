package com.example.chatgptclone.data.repository

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SettingsRepository @Inject constructor(
    @ApplicationContext context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "secure_chat_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun getApiKey(): String {
        return prefs.getString("api_key", "") ?: ""
    }

    fun saveApiKey(key: String) {
        prefs.edit().putString("api_key", key).apply()
    }

    fun getSearchApiKey(): String {
        return prefs.getString("search_api_key", "") ?: ""
    }

    fun saveSearchApiKey(key: String) {
        prefs.edit().putString("search_api_key", key).apply()
    }

    fun getSelectedModel(): String {
        return prefs.getString("selected_model", "gemini-3.6-flash") ?: "gemini-3.6-flash"
    }

    fun saveSelectedModel(model: String) {
        prefs.edit().putString("selected_model", model).apply()
    }

    fun getThemeMode(): String {
        return prefs.getString("theme_mode", "SYSTEM") ?: "SYSTEM"
    }

    fun saveThemeMode(mode: String) {
        prefs.edit().putString("theme_mode", mode).apply()
    }
}
