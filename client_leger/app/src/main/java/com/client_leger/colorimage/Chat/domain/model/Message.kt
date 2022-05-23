package com.client_leger.colorimage.Chat.domain.model

data class Message(
    val _id: String,
    val timestamp: String,
    val username: String,
    val message: String,
    val room: String,
)

class InvalidMessageException(message: String) : Exception(message)
