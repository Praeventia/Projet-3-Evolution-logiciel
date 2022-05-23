package com.client_leger.colorimage.Chat.domain.use_case

data class RoomUseCases(
    val createRoom: CreateRoom,
    val deleteRoom: DeleteRoom,
    val getAllAvailableRooms: GetAllAvailableRooms,
    val getAllJoinedRooms: GetAllJoinedRooms,
    val joinRoom: JoinRoom,
    val leaveRoom: LeaveRoom
)
