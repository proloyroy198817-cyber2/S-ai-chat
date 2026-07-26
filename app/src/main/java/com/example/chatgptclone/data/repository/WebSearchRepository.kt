package com.example.chatgptclone.data.repository

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
        val encoded = java.net.URLEncoder.encode(query, "UTF-8")
        return listOf(
            SearchResult(
                title = "Google Search: $query",
                url = "https://www.google.com/search?q=$encoded",
                snippet = "Live web results & real-time top matches from Google Search Engine."
            ),
            SearchResult(
                title = "Bing Search & AI Index: $query",
                url = "https://www.bing.com/search?q=$encoded",
                snippet = "Real-time web indexing, articles, and verified data from Bing Search Engine."
            ),
            SearchResult(
                title = "Google News: $query",
                url = "https://news.google.com/search?q=$encoded",
                snippet = "Recent developments, news reports, and live media updates for $query."
            )
        )
    }
}
