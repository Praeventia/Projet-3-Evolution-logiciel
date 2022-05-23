package com.client_leger.colorimage.Chat.domain.use_case

data class MessageUseCases(
    val getMessageHistory: GetMessages,
    val sendMessage: SendMessage,
    val receiveMessage: ReceiveMessage,
    val receiveAllMessage: ReceiveAllMessage
)
