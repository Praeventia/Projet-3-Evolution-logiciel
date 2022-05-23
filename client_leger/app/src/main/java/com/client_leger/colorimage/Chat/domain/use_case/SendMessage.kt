package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.model.InvalidMessageException
import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.domain.repository.MessageRepository

class SendMessage(
    private val repository: MessageRepository
) {

    @Throws(InvalidMessageException::class)
    operator fun invoke(message: Message, drawingID: String?) {
        if (message.message.isBlank()) {
            throw InvalidMessageException("Le message ne peut pas être vide")
        }
        if (drawingID != null && message.room == "Dessin") {
            repository.sendMessage(message, drawingID)
        } else repository.sendMessage(message)
    }
}
