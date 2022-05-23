package com.client_leger.colorimage.Chat.domain.use_case

import com.client_leger.colorimage.Chat.domain.repository.RoomRepository

class GetAllAvailableRooms(
    private val repository: RoomRepository
) {
    suspend operator fun invoke(): Result<List<String>> {
        return repository.getAllAvailableRooms()
    }
}
