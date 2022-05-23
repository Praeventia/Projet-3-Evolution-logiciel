package com.client_leger.colorimage.Api.Drawing

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async

object DrawingHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun drawingInfo(drawingID:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/drawingInfo/$drawingID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userIsOwnerOfDrawing(drawingID:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/userIsOwnerOfDrawing/$drawingID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allCommandsInDrawing(drawingID:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/allCommandsInDrawing/$drawingID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allCommandsSelected(drawingID:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/selectedCommandInDrawing/$drawingID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun connectedUserInDrawing(drawingID:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/connectedUserInDrawing/$drawingID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allDrawingsContributed() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/allDrawingsContributed")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allDrawingsOwnByUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/allDrawingOwnByUser")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun getDrawing(id:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/image/drawing/$id")
            .header(Pair("Authorization", bearerKey))
            .response()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun recentDrawingEdited() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/recentDrawingEdited")
        .header(Pair("Authorization", bearerKey))
        .response()
    }.await()

    suspend fun allMessagesInDrawing(id:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/drawings/allMessagesInDrawing/$id")
            .header(Pair("Authorization", bearerKey))
            .response()
    }.await()
}
