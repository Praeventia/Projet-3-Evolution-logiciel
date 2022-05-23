package com.client_leger.colorimage.Chat.domain.repository

import com.client_leger.colorimage.Chat.domain.model.Message
import kotlinx.coroutines.flow.Flow

interface MessageRepository {

    fun getAllMessages(): Flow<Message>

    suspend fun getMessageHistoryByChannel(channel: String): Result<List<Message>>

    suspend fun getMessageHistoryByChannel(channel: String, drawingID: String): Result<List<Message>>

    fun sendMessage(message: Message)

    fun sendMessage(message: Message, drawingID: String)

    fun getNewMessages(channelName: String): Flow<Message>

    fun getNewMessages(channelName: String, drawingID: String): Flow<Message>
}
