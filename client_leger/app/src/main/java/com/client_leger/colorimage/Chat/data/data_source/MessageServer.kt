package com.client_leger.colorimage.Chat.data.data_source

import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.drawing.converter.DrawingSocketHandler
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.onEach
import org.json.JSONObject
import java.lang.Exception

object MessageServer {
    var newMessageFlow = MutableSharedFlow<Message>()

    var drawingNewMessageFlow = MutableSharedFlow<Message>()

    suspend fun startMessageFlow() {
        callbackFlow {
            val mSocket = SocketHandler.getSocket()
            mSocket.on("messageFromServer") { args ->
                val data = args[0] as JSONObject
                val id = data.getString("_id")
                val username = data.getString("username")
                val message = data.getString("message")
                val timestamp = data.getString("timestamp")
                val room = data.getString("room")
                val newMessage = Message(id, timestamp, username, message, room)
                trySend(newMessage)
            }
            mSocket.on("exception") { args ->
                val data = args[0] as JSONObject
                trySend(Message("exception", "", "", data.getString("message"), ""))
            }
            awaitClose { mSocket.close() }
        }.collect {
            newMessageFlow.emit(it)
        }
    }

    suspend fun startDrawingMessageFlow() {
        callbackFlow {
            val mSocket = DrawingSocketHandler.getSocket()
            mSocket.on("messageFromServerInDrawing") { args ->
                val data = args[0] as JSONObject
                val id = data.getString("_id")
                val username = data.getString("username")
                val message = data.getString("message")
                val timestamp = data.getString("timestamp")
                val room = "Dessin"
                val newMessage = Message(id, timestamp, username, message, room)
                trySend(newMessage)
            }
            mSocket.on("exception") { args ->
                val data = args[0] as JSONObject
                //trySend(Message("exception", "", "", data.getString("error"), ""))
            }
            awaitClose { }
        }.collect {
            drawingNewMessageFlow.emit(it)
        }
    }
}
