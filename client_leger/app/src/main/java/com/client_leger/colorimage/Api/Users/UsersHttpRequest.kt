package com.client_leger.colorimage.Api.Users

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.FileDataPart
import com.github.kittinunf.fuel.core.Method
import kotlinx.coroutines.*
import java.io.ByteArrayOutputStream
import java.io.File

object UsersHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userData() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userData")
            .header(Pair("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeUsername(username: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.put("https://backendpi3.fibiess.com/users/changeUsername", listOf("username" to username))
            .header(Pair("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allDefaultAvatar() = GlobalScope.async {
        return@async Fuel.get("https://backendpi3.fibiess.com/users/allDefaultAvatar")
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeToDefaultAvatar(defaultAvatarName: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.put("https://backendpi3.fibiess.com/users/changeToDefaultAvatar?defaultAvatar=$defaultAvatarName")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeAvatar(file: File) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.upload("https://backendpi3.fibiess.com/users/changeAvatar", Method.PUT)
            .add { FileDataPart(file, name = "file", filename="file.png") }
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()

    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userInfo(userId : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userInfo/$userId")
            .header(Pair("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userLoginTime() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userLoginTime")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userAverageCollaborationTime() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userAverageCollaborationTime")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userTotalCollaborationTime() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userTotalCollaborationTime")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun userDisconnectTime() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userDisconnectTime")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun getUserInfoById(id:String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/userInfo/$id")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun numberOfPixelCrossUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/numberOfPixelCrossUser")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun numberOfMessageSentUser() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/users/numberOfMessageSentUser")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

}
