package com.client_leger.colorimage.Api.Rooms

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async

object RoomsHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun createRoom(room: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.put(
            "https://backendpi3.fibiess.com/rooms/createRoom",
            listOf("roomName" to room)
        )
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun addUserToRoom(room: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.put(
            "https://backendpi3.fibiess.com/rooms/addUserToRoom",
            listOf("roomName" to room)
        )
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun removeUserFromRoom(room: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post(
            "https://backendpi3.fibiess.com/rooms/removeUserFromRoom",
            listOf("roomName" to room)
        )
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allJoinedRooms() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/rooms/allRoomsJoin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allRooms() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/rooms/allRooms")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allMessagesInRoom(room: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/rooms/allMessagesInRoom/$room")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun deleteRoom(room: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post(
            "https://backendpi3.fibiess.com/rooms/deleteRoom",
            listOf("roomName" to room)
        )
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()


}
