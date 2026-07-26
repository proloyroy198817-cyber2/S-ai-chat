package com.example.chatgptclone.ui.viewmodel

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
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
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
        val userMsg = ChatMessage(
            id = userMsgId,
            threadId = currentThreadId,
            role = Role.USER,
            content = userText,
            timestamp = System.currentTimeMillis(),
            imageUrl = imageUrl
        )

        viewModelScope.launch {
            chatDao.insertMessage(
                ChatMessageEntity(
                    id = userMsg.id,
                    threadId = userMsg.threadId,
                    role = userMsg.role.name,
                    content = userMsg.content,
                    timestamp = userMsg.timestamp,
                    imageUrl = userMsg.imageUrl
                )
            )

            val assistantMsgId = UUID.randomUUID().toString()
            var assistantContent = ""
            val assistantMsg = ChatMessage(
                id = assistantMsgId,
                threadId = currentThreadId,
                role = Role.ASSISTANT,
                content = "",
                timestamp = System.currentTimeMillis(),
                imageUrl = null,
                isStreaming = true,
                isError = false
            )
            
            _messages.value = _messages.value + userMsg + assistantMsg
            _isStreaming.value = true

            val apiKey = settingsRepo.getApiKey()
            val endpoint = "https://api.anthropic.com/v1/messages"
            val requestBody = """
                {
                    "model": "${settingsRepo.getSelectedModel()}",
                    "max_tokens": 2048,
                    "stream": true,
                    "messages": [{"role": "user", "content": "$userText"}]
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
                    assistantContent += "\n[Error: ${e.localizedMessage}]"
                } finally {
                    _isStreaming.value = false
                    chatDao.insertMessage(
                        ChatMessageEntity(
                            id = assistantMsgId,
                            threadId = currentThreadId,
                            role = Role.ASSISTANT.name,
                            content = assistantContent,
                            timestamp = System.currentTimeMillis(),
                            imageUrl = null
                        )
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
