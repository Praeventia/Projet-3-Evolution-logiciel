package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.domain.repository.MessageRepository
import kotlinx.coroutines.flow.Flow

class ReceiveAllMessage(
    private val repository: MessageRepository
) {

    operator fun invoke(): Flow<Message> {
        return repository.getAllMessages()
    }
}
