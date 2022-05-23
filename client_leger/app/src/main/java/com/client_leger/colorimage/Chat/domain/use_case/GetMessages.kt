package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.domain.repository.MessageRepository

class GetMessages(
    private val repository: MessageRepository
) {

    suspend operator fun invoke(channelName: String, drawingID: String?): Result<List<Message>> {
        if (drawingID != null && channelName =="Dessin") {
            return repository.getMessageHistoryByChannel(channelName, drawingID)
        } else return repository.getMessageHistoryByChannel(channelName)
    }
}
