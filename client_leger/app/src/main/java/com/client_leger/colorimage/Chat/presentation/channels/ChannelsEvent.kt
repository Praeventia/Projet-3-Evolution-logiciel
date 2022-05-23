package com.client_leger.colorimage.Chat.presentation.channels

sealed class ChannelsEvent {
    data class LeaveRoom(val roomName: String) : ChannelsEvent()
    data class ChangeRoom(val roomName: String) : ChannelsEvent()
    data class DeleteRoom(val roomName: String) : ChannelsEvent()
    data class CreateRoom(val roomName: String) : ChannelsEvent()
    data class JoinRoom(val roomName: String) : ChannelsEvent()
    object RefreshJoinableRooms : ChannelsEvent()
}
