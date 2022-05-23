package com.client_leger.colorimage.Api.Albums

import com.client_leger.colorimage.Chat.SocketHandler
import com.github.kittinunf.fuel.Fuel
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async

object AlbumsHttpRequest {

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun albumInfo(albumID : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/albumInfo/$albumID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun isOwner(albumID : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/userIsOwnerOfAlbum/$albumID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allAlbums() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allAlbum")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allAlbumsJoin () = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allAlbumJoin")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun deleteAlbum(albumID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/deleteAlbum", listOf("albumID" to albumID))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun removeUserFromAlbum(albumID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/removeUserFromAlbum", listOf("albumID" to albumID))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeAlbumName(albumID: String, albumName : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/changeAlbumName", listOf("albumID" to albumID, "albumName" to albumName))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun changeAlbumDescription(albumID: String, albumDescription : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/changeDescription", listOf("albumID" to albumID, "description" to albumDescription))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun getAllUserRequestingToJoin(albumID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allUserRequestingToJoinAlbum/$albumID")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun requestToJoinAlbum(albumID: String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/requestToJoinPrivateAlbum", listOf("albumID" to albumID))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allowUserToJoinPrivateAlbum(albumID: String, userIDToAdd : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/allowUserToJoinPrivateAlbum", listOf("albumID" to albumID, "userIDToAdd" to userIDToAdd))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun rejectUserToJoinPrivateAlbum(albumID: String, userIDToReject : String) = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.post("https://backendpi3.fibiess.com/albums/rejectUserToJoinPrivateAlbum", listOf("albumID" to albumID, "userIDToReject" to userIDToReject))
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun getAllAlbumWithExposition() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allAlbumWithExposition")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allOwnedAlbum() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allOwnedAlbum")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()

    @OptIn(DelicateCoroutinesApi::class)
    suspend fun allPrivateAlbumJoin() = GlobalScope.async {
        val token = SocketHandler.getToken()
        val bearerKey = "Bearer $token"
        return@async Fuel.get("https://backendpi3.fibiess.com/albums/allOwnedAlbum")
            .header(Pair("Authorization", bearerKey))
            .responseString()
    }.await()
}
