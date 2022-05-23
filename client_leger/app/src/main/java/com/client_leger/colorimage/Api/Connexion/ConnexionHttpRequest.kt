package com.client_leger.colorimage.Api.Connexion

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import kotlinx.coroutines.*

object ConnexionHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun signUp(username: String, email: String, password: String) = GlobalScope.async {
        return@async Fuel.put("https://backendpi3.fibiess.com/connexion/createProfile", listOf("username" to username, "email" to email, "password" to password))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun login(email: String, password: String) = GlobalScope.async {
        return@async Fuel.post("https://backendpi3.fibiess.com/connexion/login", listOf("email" to email, "password" to password))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun logout() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey:String = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/connexion/disconnect")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString ()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeEmailProtection() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey: String = "Bearer $token"
        return@async Fuel.put(
            "https://backendpi3.fibiess.com/users/changeEmailProtection")
            .header(Pair<String, String>("Authorization", bearerKey))
            .responseString()
    }.await()

}
