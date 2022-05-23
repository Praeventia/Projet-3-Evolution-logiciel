package com.client_leger.colorimage.album.data.intermediate

import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Api.Albums.AlbumsHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.album.data.AlbumData
import com.client_leger.colorimage.album.data.UserData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

object IntermediateAlbumServer {

    private suspend fun getInfoAlbum(albumID : String) : AlbumData? {
        val (_, response, _) = AlbumsHttpRequest.albumInfo(albumID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONObject(response.data.toString(Charsets.UTF_8))
        return AlbumData(
            albumDataResponse.getString("albumName"),
            albumID,
            albumDataResponse.getString("albumDescription"),
            albumDataResponse.getBoolean("isOwner"),
            albumDataResponse.getBoolean("isJoin"),
        )
    }

    private suspend fun userIsOwner(albumID: String): Boolean? {
        val (_, response, _) = AlbumsHttpRequest.isOwner(albumID)
        if (response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        return response.data.toString(Charsets.UTF_8).toBoolean()
    }

    suspend fun getAllAlbums(): List<AlbumData>?{
        val (_, response, _) = AlbumsHttpRequest.allAlbums()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))

        val list = arrayListOf<AlbumData>()
        for(i in 0 until albumDataResponse.length()){
            val jsonObject = albumDataResponse.getJSONObject(i)
            list.add(AlbumData(
                jsonObject.getString("albumName"),
                jsonObject.getString("albumID"),
                jsonObject.getString("albumDescription"),
                jsonObject.getBoolean("isOwner"),
                jsonObject.getBoolean("isJoin"),
            ))
        }
        return list
    }

    suspend fun getAllAlbumsJoinID(): List<String>?{
        val (_, response, _) = AlbumsHttpRequest.allAlbumsJoin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
        return List(albumDataResponse.length()){
            albumDataResponse.get(it).toString()
        }
    }

    suspend fun getAllAlbumsJoinData(): List<AlbumData>?{
        val (_, response, _) = AlbumsHttpRequest.allAlbumsJoin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
        val listAlbumData = arrayListOf<AlbumData>()
        val map = mutableMapOf<Int, AlbumData>()
        coroutineScope {
            (0 until albumDataResponse.length()).map {
                val jsonItemAlbum = albumDataResponse.get(it)
                async(Dispatchers.IO) {
                    val data = getInfoAlbum(jsonItemAlbum.toString())
                    if (data != null ){
                        map[it] = data
                    }
                }
            }.awaitAll()
        }
        map.toSortedMap().forEach { (_, albumData) -> listAlbumData.add(albumData) }
        return listAlbumData
    }

    suspend fun deleteAlbum (albumID: String): Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.deleteAlbum(albumID)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun removeUserFromAlbum (albumID: String): Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.removeUserFromAlbum(albumID)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun changeAlbumName (albumID: String, albumName:String): Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.changeAlbumName(albumID, albumName)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun changeAlbumDescription (albumID: String, albumDescription:String): Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.changeAlbumDescription(albumID, albumDescription)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun getInfoUser(userID : String) : UserData?{
        val (_, response, _) = UsersHttpRequest.userInfo(userID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val userDataResponse = JSONObject(response.data.toString(Charsets.UTF_8))
        return UserData(
            userDataResponse.getString("username"),
            userID
        )
    }

    suspend fun getAllUserRequestingToJoin (albumID: String): List<UserData>?{
        val (_, response, _) = AlbumsHttpRequest.getAllUserRequestingToJoin(albumID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val userRequesting = JSONArray(response.data.toString(Charsets.UTF_8))
        val listUserData = arrayListOf<UserData>()
        val map = mutableMapOf<Int, UserData>()
        coroutineScope {
            (0 until userRequesting.length()).map {
                val jsonItemAlbum = userRequesting.get(it)
                async(Dispatchers.IO) {
                    val data = getInfoUser(jsonItemAlbum.toString())
                    if (data != null ){
                        map[it] = data
                    }
                }
            }.awaitAll()
        }
        map.toSortedMap().forEach { (_, drawingData) -> listUserData.add(drawingData) }
        return listUserData
    }

    suspend fun requestToJoinAlbum (albumID: String): Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.requestToJoinAlbum(albumID)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun allowUserToJoinPrivateAlbum (albumID: String, userIDToAdd : String): Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.allowUserToJoinPrivateAlbum(albumID, userIDToAdd)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun rejectUserToJoinPrivateAlbum(albumID: String, userIDToReject : String) : Result<Unit>{
        val (_, response, _) = AlbumsHttpRequest.rejectUserToJoinPrivateAlbum(albumID, userIDToReject)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun getAllAlbumWithExposition() : List<AlbumData>?{
        val (_, response, _) = AlbumsHttpRequest.getAllAlbumWithExposition()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
        val listAlbumData = arrayListOf<AlbumData>()
        val map = mutableMapOf<Int, AlbumData>()
        coroutineScope {
            (0 until albumDataResponse.length()).map {
                val jsonItemAlbum = albumDataResponse.get(it)
                async(Dispatchers.IO) {
                    val data = getInfoAlbum(jsonItemAlbum.toString())
                    if (data != null ){
                        map[it] = data
                    }
                }
            }.awaitAll()
        }
        map.toSortedMap().forEach { (_, albumData) -> listAlbumData.add(albumData) }
        return listAlbumData
    }

    suspend fun getNumberAllOwnedAlbum(): String{
        val (_, response, _) = AlbumsHttpRequest.allOwnedAlbum()
        return if (response.statusCode.toString() != Constants.SUCCES_STATUS) "0"
        else{
            try {
                val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
                albumDataResponse.length().toString()
            }catch (e:JSONException){
                "0"
            }
        }
    }

    suspend fun allPrivateAlbumJoin(): String{
        val (_, response, _) = AlbumsHttpRequest.allPrivateAlbumJoin()
        return if (response.statusCode.toString() != Constants.SUCCES_STATUS) "0"
        else{
            try {
                val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
                albumDataResponse.length().toString()
            }catch (e:JSONException){
                "0"
            }
        }
    }
}
