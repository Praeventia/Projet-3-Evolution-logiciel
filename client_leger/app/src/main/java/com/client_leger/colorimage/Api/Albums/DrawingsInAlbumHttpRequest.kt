package com.client_leger.colorimage.Api.Albums

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async

object DrawingsInAlbumHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allDrawingInAlbum(albumID : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allDrawingInAlbum/$albumID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun deleteDrawing(drawingID : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/deleteDrawing", listOf("drawingID" to drawingID))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()


    @OptIn(DelicateCoroutinesApi::class)
    suspend fun createDrawing(drawingName:String, albumID : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.put("https://backendpi3.fibiess.com/albums/createDrawing", listOf("drawingName" to drawingName,"albumID" to albumID))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun createDrawing(drawingName:String, albumID : String, password:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.put("https://backendpi3.fibiess.com/albums/createDrawing", listOf("drawingName" to drawingName,"albumID" to albumID, "password" to password))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun verifyPassword(drawingID: String, password:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/drawings/verifyPasswordDrawing", listOf("drawingID" to drawingID, "password" to password))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeDrawingExposition(drawingID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/drawings/changeDrawingExposition", listOf("drawingID" to drawingID))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allExposedDrawingInAlbum(albumID : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allExposedDrawingInAlbum/$albumID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()
}
