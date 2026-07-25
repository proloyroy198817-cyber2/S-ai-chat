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
        // Swappable backend (Google Custom Search, Bing, Tavily or Serper)
        return listOf(
            SearchResult(
                title = "$query - Documentation & Official Reference",
                url = "https://en.wikipedia.org/wiki/Special:Search?search=$query",
                snippet = "Official web search results and technical documentation for $query."
            ),
            SearchResult(
                title = "Latest Updates & News: $query",
                url = "https://news.google.com/search?q=$query",
                snippet = "Recent developments, research papers, and live telemetry for $query."
            )
        )
    }
}
