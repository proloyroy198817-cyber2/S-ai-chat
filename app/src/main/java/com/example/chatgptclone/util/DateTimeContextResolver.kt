package com.example.chatgptclone.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object DateTimeContextResolver {
    fun buildSystemContextPrompt(): String {
        val now = Date()
        val timeZone = TimeZone.getDefault()
        val locale = Locale.getDefault()

        val dateFormatter = SimpleDateFormat("EEEE, MMMM dd, yyyy HH:mm:ss", locale)
        val formattedDate = dateFormatter.format(now)

        return """
            [SYSTEM REAL-TIME DEVICE CONTEXT]:
            - Current Date & Time: $formattedDate
            - Device Timezone: ${timeZone.id}
            - Device Locale: ${locale.displayName}
            Use this information whenever the user asks about today's date, time, current year, or time-relative queries.
        """.trimIndent()
    }
}
