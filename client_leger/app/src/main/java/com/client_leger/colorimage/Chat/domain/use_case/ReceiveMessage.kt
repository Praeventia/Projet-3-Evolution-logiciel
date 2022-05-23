package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.domain.repository.MessageRepository
import kotlinx.coroutines.flow.Flow

class ReceiveMessage(
    private val repository: MessageRepository
) {

    operator fun invoke(channelName: String, drawingID: String?): Flow<Message> {
        if (drawingID != null && channelName =="Dessin") {
            return repository.getNewMessages(channelName, drawingID)
        } else return repository.getNewMessages(channelName)
    }
}
