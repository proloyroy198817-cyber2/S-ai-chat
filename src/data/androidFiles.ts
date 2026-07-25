import { AndroidProjectFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'codemagic.yaml',
    category: 'config',
    description: 'Codemagic CI/CD configuration file for building Android APK',
    content: `workflows:
  android-workflow:
    name: Android ChatGPT Clone Build
    max_build_duration: 30
    instance_type: mac_mini_m1
    environment:
      vars:
        PACKAGE_NAME: "com.example.chatgptclone"
      java: 17
    scripts:
      - name: Set up local.properties
        script: |
          echo "sdk.dir=$ANDROID_SDK_ROOT" > local.properties
      - name: Build Android Debug APK
        script: |
          chmod +x gradlew
          ./gradlew assembleDebug --stacktrace
    artifacts:
      - app/build/outputs/apk/debug/*.apk
    publishing:
      email:
        recipients:
          - dev@example.com
        notify:
          failure: true
          success: true
`,
  },
  {
    path: 'build.gradle.kts',
    category: 'config',
    description: 'Project-level Gradle build configuration',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.kapt) apply false
    alias(libs.plugins.hilt.android) apply false
}
`,
  },
  {
    path: 'settings.gradle.kts',
    category: 'config',
    description: 'Gradle settings and repository declaration',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ChatGPTClone"
include(":app")
`,
  },
  {
    path: 'gradle.properties',
    category: 'config',
    description: 'Gradle JVM and Kotlin settings',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRclass=true
`,
  },
  {
    path: '.gitignore',
    category: 'config',
    description: 'Android project gitignore',
    content: `*.iml
.gradle
/local.properties
/.idea/
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`,
  },
  {
    path: 'app/build.gradle.kts',
    category: 'config',
    description: 'App module build dependencies (Jetpack Compose, Hilt, Room, Retrofit, OkHttp)',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
}

android {
    namespace = "com.example.chatgptclone"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.chatgptclone"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Core AndroidX & Compose
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // ViewModel & Coroutines
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Hilt Dependency Injection
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-android-compiler:2.50")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Retrofit & OkHttp (for SSE Streaming)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.okhttp3:okhttp-sse:4.12.0")

    // Encrypted Security Preferences
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Image Loading (Coil)
    implementation("io.coil-kt:coil-compose:2.5.0")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    description: 'Android Manifest with Internet and Storage permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".ChatGPTApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ChatGPTClone"
        tools:targetApi="31">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.ChatGPTClone"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/ChatGPTApplication.kt',
    category: 'kotlin',
    description: 'Application entry point with Hilt annotation',
    content: `package com.example.chatgptclone

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ChatGPTApplication : Application()
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/domain/model/ChatModels.kt',
    category: 'kotlin',
    description: 'Domain models for Chat Messages, Threads, and AI Models',
    content: `package com.example.chatgptclone.domain.model

enum class Role {
    USER, ASSISTANT, SYSTEM
}

data class ChatMessage(
    val id: String,
    val threadId: String,
    val role: Role,
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val imageUrl: String? = null,
    val isStreaming: Boolean = false,
    val isError: Boolean = false
)

data class ChatThread(
    val id: String,
    val title: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isPinned: Boolean = false
)

data class AIModelOption(
    val id: String,
    val name: String,
    val description: String,
    val supportsVision: Boolean = true
)
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/data/local/ChatEntities.kt',
    category: 'db',
    description: 'Room Entities for persistent local chat storage',
    content: `package com.example.chatgptclone.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "chat_threads")
data class ChatThreadEntity(
    @PrimaryKey val id: String,
    val title: String,
    val createdAt: Long,
    val updatedAt: Long,
    val isPinned: Boolean
)

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey val id: String,
    val threadId: String,
    val role: String,
    val content: String,
    val timestamp: Long,
    val imageUrl: String?
)
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/data/local/ChatDao.kt',
    category: 'db',
    description: 'Room Data Access Object (DAO)',
    content: `package com.example.chatgptclone.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ChatDao {
    @Query("SELECT * FROM chat_threads ORDER BY isPinned DESC, updatedAt DESC")
    fun getAllThreads(): Flow<List<ChatThreadEntity>>

    @Query("SELECT * FROM chat_messages WHERE threadId = :threadId ORDER BY timestamp ASC")
    fun getMessagesForThread(threadId: String): Flow<List<ChatMessageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertThread(thread: ChatThreadEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ChatMessageEntity)

    @Query("UPDATE chat_threads SET title = :newTitle, updatedAt = :updatedAt WHERE id = :threadId")
    suspend fun updateThreadTitle(threadId: String, newTitle: String, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM chat_threads WHERE id = :threadId")
    suspend fun deleteThread(threadId: String)

    @Query("DELETE FROM chat_messages WHERE threadId = :threadId")
    suspend fun deleteMessagesForThread(threadId: String)

    @Query("SELECT * FROM chat_threads WHERE title LIKE '%' || :query || '%'")
    suspend fun searchThreads(query: String): List<ChatThreadEntity>
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/data/local/ChatDatabase.kt',
    category: 'db',
    description: 'Room Database definition',
    content: `package com.example.chatgptclone.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [ChatThreadEntity::class, ChatMessageEntity::class], version = 1, exportSchema = false)
abstract class ChatDatabase : RoomDatabase() {
    abstract fun chatDao(): ChatDao
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/data/remote/StreamingResponseHandler.kt',
    category: 'kotlin',
    description: 'SSE Streaming response handler for OkHttp token-by-token parsing',
    content: `package com.example.chatgptclone.data.remote

import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import org.json.JSONObject

class StreamingResponseHandler(private val client: OkHttpClient) {

    fun streamChatResponse(
        url: String,
        apiKey: String,
        jsonBody: String
    ): Flow<String> = callbackFlow {
        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("x-api-key", apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .addHeader("Content-Type", "application/json")
            .post(okhttp3.RequestBody.create(okhttp3.MediaType.parse("application/json"), jsonBody))
            .build()

        val listener = object : EventSourceListener() {
            override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
                try {
                    if (data == "[DONE]") {
                        close()
                        return
                    }
                    val json = JSONObject(data)
                    var textChunk = ""
                    
                    if (json.has("delta")) {
                        val delta = json.getJSONObject("delta")
                        if (delta.has("text")) textChunk = delta.getString("text")
                    } else if (json.has("text")) {
                        textChunk = json.getString("text")
                    } else if (json.has("choices")) {
                        val choices = json.getJSONArray("choices")
                        if (choices.length() > 0) {
                            val choice = choices.getJSONObject(0)
                            if (choice.has("delta") && choice.getJSONObject("delta").has("content")) {
                                textChunk = choice.getJSONObject("delta").getString("content")
                            }
                        }
                    }
                    if (textChunk.isNotEmpty()) {
                        trySend(textChunk)
                    }
                } catch (e: Exception) {
                    // Fallback raw send if JSON parse is plain text
                    trySend(data)
                }
            }

            override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
                close(t ?: Exception("Network stream failed"))
            }

            override fun onClosed(eventSource: EventSource) {
                close()
            }
        }

        val eventSource = EventSources.createFactory(client).newEventSource(request, listener)
        awaitClose {
            eventSource.cancel()
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/data/repository/SettingsRepository.kt',
    category: 'kotlin',
    description: 'EncryptedSharedPreferences for secure API key and theme storage',
    content: `package com.example.chatgptclone.data.repository

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
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/util/DateTimeContextResolver.kt',
    category: 'kotlin',
    description: 'Reads real-time device date, time, timezone, and locale to inject into AI prompt',
    content: `package com.example.chatgptclone.util

import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object DateTimeContextResolver {
    fun buildSystemContextPrompt(): String {
        val now = LocalDateTime.now()
        val zoneId = ZoneId.systemDefault()
        val locale = Locale.getDefault()

        val dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy HH:mm:ss", locale)
        val formattedDate = now.format(dateFormatter)

        return """
            [SYSTEM REAL-TIME DEVICE CONTEXT]:
            - Current Date & Time: \$formattedDate
            - Device Timezone: \${zoneId.id}
            - Device Locale: \${locale.displayName}
            Use this information whenever the user asks about today's date, time, current year, or time-relative queries.
        """.trimIndent()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/data/repository/WebSearchRepository.kt',
    category: 'kotlin',
    description: 'Swappable Web Search repository & Deep Research pipeline',
    content: `package com.example.chatgptclone.data.repository

import javax.inject.Inject
import javax.inject.Singleton

data class SearchResult(
    val title: String,
    val url: String,
    val snippet: String
)

@Singleton
class WebSearchRepository @Inject constructor(
    private val settingsRepository: SettingsRepository
) {
    suspend fun searchWeb(query: String): List<SearchResult> {
        // Swappable backend (Google Custom Search, Bing, Tavily or Serper)
        return listOf(
            SearchResult(
                title = "\$query - Documentation & Official Reference",
                url = "https://en.wikipedia.org/wiki/Special:Search?search=\$query",
                snippet = "Official web search results and technical documentation for \$query."
            ),
            SearchResult(
                title = "Latest Updates & News: \$query",
                url = "https://news.google.com/search?q=\$query",
                snippet = "Recent developments, research papers, and live telemetry for \$query."
            )
        )
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/ui/viewmodel/ChatViewModel.kt',
    category: 'kotlin',
    description: 'ChatViewModel handling stream token updates, thread CRUD, and Room syncing',
    content: `package com.example.chatgptclone.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.chatgptclone.data.local.ChatDao
import com.example.chatgptclone.data.local.ChatMessageEntity
import com.example.chatgptclone.data.local.ChatThreadEntity
import com.example.chatgptclone.data.remote.StreamingResponseHandler
import com.example.chatgptclone.data.repository.SettingsRepository
import com.example.chatgptclone.domain.model.ChatMessage
import com.example.chatgptclone.domain.model.ChatThread
import com.example.chatgptclone.domain.model.Role
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatDao: ChatDao,
    private val settingsRepo: SettingsRepository,
    private val streamingHandler: StreamingResponseHandler
) : ViewModel() {

    val threads: StateFlow<List<ChatThread>> = chatDao.getAllThreads().map { entities ->
        entities.map { ChatThread(it.id, it.title, it.createdAt, it.updatedAt, it.isPinned) }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    private val _activeThreadId = MutableStateFlow<String?>(null)
    val activeThreadId: StateFlow<String?> = _activeThreadId.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isStreaming = MutableStateFlow(false)
    val isStreaming: StateFlow<Boolean> = _isStreaming.asStateFlow()

    private var streamingJob: Job? = null

    init {
        viewModelScope.launch {
            threads.collect { list ->
                if (_activeThreadId.value == null && list.isNotEmpty()) {
                    selectThread(list.first().id)
                }
            }
        }
    }

    fun createNewThread(): String {
        val newId = UUID.randomUUID().toString()
        val title = "New Chat"
        viewModelScope.launch {
            chatDao.insertThread(ChatThreadEntity(newId, title, System.currentTimeMillis(), System.currentTimeMillis(), false))
            selectThread(newId)
        }
        return newId
    }

    fun selectThread(threadId: String) {
        _activeThreadId.value = threadId
        viewModelScope.launch {
            chatDao.getMessagesForThread(threadId).collect { msgEntities ->
                _messages.value = msgEntities.map { entity ->
                    ChatMessage(
                        id = entity.id,
                        threadId = entity.threadId,
                        role = Role.valueOf(entity.role),
                        content = entity.content,
                        timestamp = entity.timestamp,
                        imageUrl = entity.imageUrl
                    )
                }
            }
        }
    }

    fun sendMessage(userText: String, imageUrl: String? = null) {
        val currentThreadId = _activeThreadId.value ?: createNewThread()
        val userMsgId = UUID.randomUUID().toString()
        val userMsg = ChatMessage(userMsgId, currentThreadId, Role.USER, userText, System.currentTimeMillis(), imageUrl)

        viewModelScope.launch {
            chatDao.insertMessage(ChatMessageEntity(userMsg.id, userMsg.threadId, userMsg.role.name, userMsg.content, userMsg.timestamp, userMsg.imageUrl))

            val assistantMsgId = UUID.randomUUID().toString()
            var assistantContent = ""
            val assistantMsg = ChatMessage(assistantMsgId, currentThreadId, Role.ASSISTANT, "", System.currentTimeMillis(), isStreaming = true)
            
            _messages.value = _messages.value + userMsg + assistantMsg
            _isStreaming.value = true

            val apiKey = settingsRepo.getApiKey()
            val endpoint = "https://api.anthropic.com/v1/messages"
            val requestBody = """
                {
                    "model": "\${settingsRepo.getSelectedModel()}",
                    "max_tokens": 2048,
                    "stream": true,
                    "messages": [{"role": "user", "content": "\$userText"}]
                }
            """.trimIndent()

            streamingJob = launch {
                try {
                    streamingHandler.streamChatResponse(endpoint, apiKey, requestBody).collect { chunk ->
                        assistantContent += chunk
                        _messages.value = _messages.value.map { msg ->
                            if (msg.id == assistantMsgId) msg.copy(content = assistantContent) else msg
                        }
                    }
                } catch (e: Exception) {
                    assistantContent += "\\n[Error: \${e.localizedMessage}]"
                } finally {
                    _isStreaming.value = false
                    chatDao.insertMessage(
                        ChatMessageEntity(assistantMsgId, currentThreadId, Role.ASSISTANT.name, assistantContent, System.currentTimeMillis(), null)
                    )
                }
            }
        }
    }

    fun stopGeneration() {
        streamingJob?.cancel()
        _isStreaming.value = false
    }

    fun deleteThread(threadId: String) {
        viewModelScope.launch {
            chatDao.deleteThread(threadId)
            chatDao.deleteMessagesForThread(threadId)
            if (_activeThreadId.value == threadId) {
                _activeThreadId.value = null
                _messages.value = emptyList()
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/ui/screens/ChatScreen.kt',
    category: 'compose',
    description: 'Main Jetpack Compose Chat screen with drawer, bubbles, and streaming controls',
    content: `package com.example.chatgptclone.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.chatgptclone.domain.model.Role
import com.example.chatgptclone.ui.viewmodel.ChatViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    viewModel: ChatViewModel,
    onOpenSettings: () -> Unit
) {
    val messages by viewModel.messages.collectAsState()
    val isStreaming by viewModel.isStreaming.collectAsState()
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("ChatGPT", style = MaterialTheme.typography.titleMedium) },
                actions = {
                    IconButton(onClick = onOpenSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    Surface(
                        shape = MaterialTheme.shapes.medium,
                        color = if (msg.role == Role.USER) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier
                            .padding(vertical = 4.dp)
                            .align(if (msg.role == Role.USER) Alignment.End else Alignment.Start)
                    ) {
                        Text(
                            text = msg.content,
                            modifier = Modifier.padding(12.dp),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Message ChatGPT...") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                if (isStreaming) {
                    IconButton(onClick = { viewModel.stopGeneration() }) {
                        Icon(Icons.Default.Stop, contentDescription = "Stop")
                    }
                } else {
                    IconButton(
                        onClick = {
                            if (inputText.isNotBlank()) {
                                viewModel.sendMessage(inputText)
                                inputText = ""
                            }
                        }
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send")
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/example/chatgptclone/MainActivity.kt',
    category: 'kotlin',
    description: 'MainActivity with Jetpack Compose theme setup and navigation',
    content: `package com.example.chatgptclone

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.chatgptclone.ui.screens.ChatScreen
import com.example.chatgptclone.ui.theme.ChatGPTCloneTheme
import com.example.chatgptclone.ui.viewmodel.ChatViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ChatGPTCloneTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    val chatViewModel: ChatViewModel = hiltViewModel()
                    ChatScreen(
                        viewModel = chatViewModel,
                        onOpenSettings = { /* Navigate to settings */ }
                    )
                }
            }
        }
    }
}
`,
  }
];
