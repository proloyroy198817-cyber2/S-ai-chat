package com.example.chatgptclone.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [ChatThreadEntity::class, ChatMessageEntity::class], version = 1, exportSchema = false)
abstract class ChatDatabase : RoomDatabase() {
    abstract fun chatDao(): ChatDao
}
