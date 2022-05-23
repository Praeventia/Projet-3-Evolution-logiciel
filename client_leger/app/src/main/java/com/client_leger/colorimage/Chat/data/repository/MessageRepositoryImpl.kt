package com.client_leger.colorimage.Chat.data.repository

import com.client_leger.colorimage.Api.Drawing.DrawingHttpRequest
import com.client_leger.colorimage.Api.Rooms.RoomsHttpRequest
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Chat.data.data_source.MessageServer
import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.domain.repository.MessageRepository
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.drawing.converter.DrawingSocketHandler
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class MessageRepositoryImpl : MessageRepository {

    override fun getAllMessages(): Flow<Message> {
        return MessageServer.newMessageFlow
    }

    override suspend fun getMessageHistoryByChannel(channel: String): Result<List<Message>> {
        val (_, messageListResponse, _) = RoomsHttpRequest.allMessagesInRoom(channel)
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_STATUS) {
            var exception: Exception
            try {
                exception = Exception(JSONObject(messageListResponse.data.toString()).getString("message"))
            } catch (e: Throwable) {
                exception = Exception(messageListResponse.responseMessage)
            }
            return Result.failure(exception)
        }
        val dataResponse = JSONArray(messageListResponse.data.toString(Charsets.UTF_8))

        return Result.success(List(dataResponse.length()) {
            val jsonItem = dataResponse.getJSONObject(it)
            formatTimestamp(
                Message(
                    jsonItem.getString("_id"),
                    jsonItem.getString("timestamp"),
                    jsonItem.getString("username"),
                    jsonItem.getString("message"),
                    jsonItem.getString("room")
                )
            )
        })
    }

    override suspend fun getMessageHistoryByChannel(
        channel: String,
        drawingID: String
    ): Result<List<Message>> {
        val (_, messageListResponse, _) = DrawingHttpRequest.allMessagesInDrawing(drawingID)
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_STATUS) return Result.failure(
            Exception(messageListResponse.responseMessage)
        )
        val dataResponse = JSONArray(messageListResponse.data.toString(Charsets.UTF_8))

        return Result.success(List(dataResponse.length()) {
            val jsonItem = dataResponse.getJSONObject(it)
            formatTimestamp(
                Message(
                    jsonItem.getString("_id"),
                    jsonItem.getString("timestamp"),
                    jsonItem.getString("username"),
                    jsonItem.getString("message"),
                    channel
                )
            )
        })
    }

    private data class Data(var message: String, var room: String)

    override fun sendMessage(message: Message) {
        val data = Data(message.message, message.room)
        val jsonObject = JSONObject(Gson().toJson(data))
        SocketHandler.getSocket().emit("messageToServer", jsonObject)
    }

    private data class DataD(var message: String)

    override fun sendMessage(message: Message, drawingID: String) {
        val data = DataD(message.message)
        val jsonObject = JSONObject(Gson().toJson(data))
        DrawingSocketHandler.getSocket().emit("messageToServerInDrawing", jsonObject)
    }

    override fun getNewMessages(channelName: String): Flow<Message> {
        return MessageServer.newMessageFlow.onEach { message ->
            if (message._id == "exception") {
                throw java.lang.Exception(message.message)
            }
        }.filter { message -> message.room == channelName }
            .map { message: Message ->
                formatTimestamp(message)
            }
    }

    override fun getNewMessages(channelName: String, drawingID: String): Flow<Message> {
        return MessageServer.drawingNewMessageFlow.onEach { message ->
            if (message._id == "exception") {
                throw java.lang.Exception(message.message)
            }
        }.map { message: Message ->
            val formatted = formatTimestamp(message)
            Message(
                formatted._id,
                formatted.timestamp,
                formatted.username,
                formatted.message,
                channelName
            )
        }
    }

    private fun formatTimestamp(message: Message): Message {
        val finalTimestamp = Timestamp.dateToHour(Timestamp.stringToDate(message.timestamp))
        return Message(
            message._id,
            finalTimestamp,
            message.username,
            message.message,
            message.room
        )
    }
}
