package com.client_leger.colorimage.Chat.domain.repository

interface RoomRepository {

    suspend fun createRoom(roomName: String): Result<Unit>
    suspend fun joinRoom(roomName: String): Result<Unit>
    suspend fun quitRoom(roomName: String): Result<Unit>
    suspend fun getAllJoinedRooms(): Result<List<String>>
    suspend fun getAllAvailableRooms(): Result<List<String>>
    suspend fun deleteRoom(roomName: String): Result<Unit>
}
