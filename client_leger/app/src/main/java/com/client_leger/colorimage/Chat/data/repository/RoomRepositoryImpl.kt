package com.client_leger.colorimage.Chat.data.repository

import com.client_leger.colorimage.Api.Rooms.RoomsHttpRequest
import com.client_leger.colorimage.Chat.domain.repository.RoomRepository
import com.client_leger.colorimage.Constants.Constants
import org.json.JSONArray
import org.json.JSONObject

class RoomRepositoryImpl : RoomRepository {
    override suspend fun createRoom(roomName: String): Result<Unit> {
        val (_, messageListResponse, _) = RoomsHttpRequest.createRoom(roomName)
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_STATUS) {
            var exception: Exception
            try {
                exception = Exception(JSONObject(messageListResponse.data.toString()).getString("message"))
            } catch (e: Throwable) {
                exception = Exception(messageListResponse.responseMessage)
            }
            return Result.failure(exception)
        }
        return Result.success(Unit)
    }

    override suspend fun joinRoom(roomName: String): Result<Unit> {
        val (_, messageListResponse, _) = RoomsHttpRequest.addUserToRoom(roomName)
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_STATUS) {
            var exception: Exception
            try {
                exception = Exception(JSONObject(messageListResponse.data.toString()).getString("message"))
            } catch (e: Throwable) {
                exception = Exception(messageListResponse.responseMessage)
            }
            return Result.failure(exception)
        }
        return Result.success(Unit)
    }

    override suspend fun quitRoom(roomName: String): Result<Unit> {
        val (_, messageListResponse, _) = RoomsHttpRequest.removeUserFromRoom(roomName)
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_PUT) {
            var exception: Exception
            try {
                exception = Exception(JSONObject(messageListResponse.data.toString()).getString("message"))
            } catch (e: Throwable) {
                exception = Exception(messageListResponse.responseMessage)
            }
            return Result.failure(exception)
        }
        return Result.success(Unit)
    }

    override suspend fun getAllJoinedRooms(): Result<List<String>> {
        val (_, messageListResponse, _) = RoomsHttpRequest.allJoinedRooms()
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_STATUS) {
            var exception: Exception? = null
            try {
                exception = Exception(JSONObject(messageListResponse.data.toString()).getString("message"))
            } catch (e: Throwable) {

            } finally {
                if (exception == null) {
                    exception = Exception(messageListResponse.responseMessage)
                }
            }
            return Result.failure(exception)
        }
        val dataResponse = JSONArray(messageListResponse.data.toString(Charsets.UTF_8))

        return Result.success(List(dataResponse.length()) {
            dataResponse.getString(it)
        })
    }

    override suspend fun getAllAvailableRooms(): Result<List<String>> {
        val (_, messageListResponse, _) = RoomsHttpRequest.allRooms()
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
            dataResponse.getString(it)
        })
    }

    override suspend fun deleteRoom(roomName: String): Result<Unit> {
        val (_, messageListResponse, _) = RoomsHttpRequest.deleteRoom(roomName)
        if (messageListResponse.statusCode.toString() != Constants.SUCCES_PUT) {
            var exception: Exception
            try {
                exception = Exception(JSONObject(messageListResponse.data.toString()).getString("message"))
            } catch (e: Throwable) {
                exception = Exception(messageListResponse.responseMessage)
            }
            return Result.failure(exception)
        }
        return Result.success(Unit)
    }
}
