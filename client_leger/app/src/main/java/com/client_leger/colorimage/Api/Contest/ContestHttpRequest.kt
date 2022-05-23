package com.client_leger.colorimage.Api.Contest

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.FileDataPart
import com.github.kittinunf.fuel.core.Method
import kotlinx.coroutines.*
import java.io.ByteArrayOutputStream
import java.io.File

object ContestHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun uploadConcoursEntry(drawingID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey: String = "Bearer $token"
        return@async Fuel.put(
            "https://backendpi3.fibiess.com/concours/uploadConcoursEntry?drawingID=$drawingID")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userCanStillPublishEntry() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/userCanStillPublishEntry")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun pictureById(id: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/picture/$id")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun entryInfoById(id: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/entryInfo/$id")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allEntryCurrentConcours() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/allEntryCurrentConcours")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allEntryByUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/allEntryByUser")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun topEntryCurrentConcours() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/topEntryCurrentConcours")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun topEntryPastConcours() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/topEntryPastConcours")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun currentConcoursInfo() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/currentConcoursInfo")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun currentEntryByUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/currentEntryByUser")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allPastEntryByUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/allPastEntryByUser")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun pastConcoursInfo() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/pastConcoursInfo")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun weekInfo(id: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/concoursWeekInfo/$id")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun upvoteForEntry(drawingID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey: String = "Bearer $token"
        return@async Fuel.post(
            "https://backendpi3.fibiess.com/concours/upvoteForEntry",
            listOf("id" to drawingID)
        )
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun unupvoteForEntry(drawingID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey: String = "Bearer $token"
        return@async Fuel.post(
            "https://backendpi3.fibiess.com/concours/unupvoteForEntry",
            listOf("id" to drawingID)
        )
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun downvoteForEntry(drawingID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey: String = "Bearer $token"
        return@async Fuel.post(
            "https://backendpi3.fibiess.com/concours/downvoteForEntry",
            listOf("id" to drawingID)
        )
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun undownvoteForEntry(drawingID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey: String = "Bearer $token"
        return@async Fuel.post(
            "https://backendpi3.fibiess.com/concours/undownvoteForEntry",
            listOf("id" to drawingID)
        )
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userCanStillUpVote() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/userCanStillUpVote")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun numberOfUpVoteThisWeekByUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/concours/numberOfUpVoteThisWeekByUser")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()
}
