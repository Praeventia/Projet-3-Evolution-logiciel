package com.client_leger.colorimage.Chat.presentation.messages


sealed class MessagesEvent {
    data class SendMessage(val message: String) : MessagesEvent()
    data class ChangeChannel(val roomName: String) : MessagesEvent()
}
