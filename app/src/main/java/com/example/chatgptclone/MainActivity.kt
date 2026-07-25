package com.example.chatgptclone

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
