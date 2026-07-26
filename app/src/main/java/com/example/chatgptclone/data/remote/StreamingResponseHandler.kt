package com.example.chatgptclone.data.remote

import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import org.json.JSONObject
import javax.inject.Inject

class StreamingResponseHandler @Inject constructor(
    private val client: OkHttpClient
) {

    fun streamChatResponse(
        url: String,
        apiKey: String,
        jsonBody: String
    ): Flow<String> = callbackFlow {
        val mediaType = "application/json".toMediaTypeOrNull()
        val body = jsonBody.toRequestBody(mediaType)

        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("x-api-key", apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .addHeader("Content-Type", "application/json")
            .post(body)
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
