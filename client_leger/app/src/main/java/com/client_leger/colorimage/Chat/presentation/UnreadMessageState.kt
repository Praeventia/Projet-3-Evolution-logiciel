package com.client_leger.colorimage.Chat.presentation


data class UnreadMessageState(
    val unreadMessagesChannels: Map<String, Int> = mapOf(),
    val lastChannelUnreadChange: String = ""
)
