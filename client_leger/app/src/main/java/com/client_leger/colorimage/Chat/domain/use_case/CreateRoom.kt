package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.repository.RoomRepository

class CreateRoom(
    private val repository: RoomRepository
) {
    suspend operator fun invoke(roomName: String): Result<Unit> {

        if (roomName.isBlank()) throw Exception("Le nom de salle ne peut pas être vide")
        return repository.createRoom(roomName).onFailure { e ->
            return if (e.message == "Conflict") Result.failure(Exception("La salle $roomName existe déjà"))
            else Result.failure(e)
        }
    }
}
