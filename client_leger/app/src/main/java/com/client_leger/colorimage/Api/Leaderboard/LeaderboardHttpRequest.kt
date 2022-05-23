package com.client_leger.colorimage.Api.Leaderboard

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.FileDataPart
import com.github.kittinunf.fuel.core.Method
import kotlinx.coroutines.*
import java.io.ByteArrayOutputStream
import java.io.File

object LeaderboardHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostMessageSent() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostMessageSent")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostTotalEditionTime() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostTotalEditionTime")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostPixelCross() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostPixelCross")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostLineCount() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostLineCount")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostShapeCount() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostShapeCount")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostRecentLogin() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostRecentLogin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostOldLogin() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostOldLogin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostLogin() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostLogin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostDisconnect() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostDisconnect")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostAverageCollaborationTime() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostAverageCollaborationTime")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()


    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostRoomJoin() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostRoomJoin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostAlbumJoin() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostAlbumJoin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostDrawingContributed() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostDrawingContributed")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostVote() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostVote")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun mostConcoursEntry() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/leaderboard/mostConcoursEntry")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()
}

















