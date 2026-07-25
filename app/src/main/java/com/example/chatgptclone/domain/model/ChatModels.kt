package com.example.chatgptclone.domain.model

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
