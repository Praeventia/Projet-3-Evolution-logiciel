package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.repository.RoomRepository

class JoinRoom(
    private val repository: RoomRepository
) {
    suspend operator fun invoke(roomName: String): Result<Unit> {
        return repository.joinRoom(roomName)
    }
}
