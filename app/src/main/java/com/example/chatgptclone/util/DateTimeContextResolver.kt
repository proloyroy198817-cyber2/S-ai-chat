package com.example.chatgptclone.util

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
            - Current Date & Time: $formattedDate
            - Device Timezone: ${zoneId.id}
            - Device Locale: ${locale.displayName}
            Use this information whenever the user asks about today's date, time, current year, or time-relative queries.
        """.trimIndent()
    }
}
