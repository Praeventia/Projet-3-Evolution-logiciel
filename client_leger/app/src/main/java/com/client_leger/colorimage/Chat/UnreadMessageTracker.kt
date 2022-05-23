package com.client_leger.colorimage.Chat

import android.media.MediaPlayer
import com.client_leger.colorimage.Chat.data.data_source.MessageServer
import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.presentation.UnreadMessageState
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

object UnreadMessageTracker {
    lateinit var mediaPlayer: MediaPlayer

    val unreadMessagesState = MutableStateFlow(UnreadMessageState())
    private var unreadMessagesChannels = mutableMapOf<String, Int>()
    private var lastChannelUnreadChange: String = ""

    var activeRoomState = ""

    private var receiveMessageScope = CoroutineScope(Dispatchers.Main + Job())

    fun startUnreadMonitoring() {
        receiveMessageScope.launch {
            MessageServer.newMessageFlow.onEach { message ->
                if (message.room != "") {
                    addUnread(message)
                    publishChange()
                }
            }.cancellable().collect()
        }
    }

    fun stopUnreadMonitoring() {
        receiveMessageScope.coroutineContext.cancelChildren()
    }

    private var receiveDrawingMessageScope = CoroutineScope(Dispatchers.Main + Job())

    fun startUnreadDrawingMonitoring() {
        receiveDrawingMessageScope.launch {
            MessageServer.drawingNewMessageFlow.onEach { message ->
                if (message.room != "") {
                    addUnread(message)
                    publishChange()
                }
            }.cancellable().collect()
        }
    }

    fun stopUnreadDrawingMonitoring() {
        receiveDrawingMessageScope.coroutineContext.cancelChildren()
    }


    private fun addUnread(message: Message) {
        if (activeRoomState != message.room) {
            unreadMessagesChannels[message.room] =
                unreadMessagesChannels.getOrDefault(message.room, 0) + 1
            lastChannelUnreadChange = message.room
            mediaPlayer.start()
        }
    }

    private suspend fun publishChange() {
        unreadMessagesState.emit(
            UnreadMessageState(
                unreadMessagesChannels.toMap(),
                lastChannelUnreadChange
            )
        )
    }

    fun clearUnread(room: String) {
        unreadMessagesChannels.remove(room)
        lastChannelUnreadChange = room
        unreadMessagesState.tryEmit(
            UnreadMessageState(
                unreadMessagesChannels.toMap(),
                lastChannelUnreadChange
            )
        )
    }
}
