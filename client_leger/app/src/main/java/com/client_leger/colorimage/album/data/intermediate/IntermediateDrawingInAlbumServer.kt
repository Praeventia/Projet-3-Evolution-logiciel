package com.client_leger.colorimage.album.data.intermediate

import com.client_leger.colorimage.Api.Albums.DrawingsInAlbumHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.album.data.DrawingData
import com.client_leger.colorimage.drawing.intermediate.IntermediateDrawingServer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.json.JSONArray
import org.json.JSONObject

object IntermediateDrawingInAlbumServer {

    suspend fun getAllDrawings(albumID:String): List<DrawingData>?{
        val (_, response, _) = DrawingsInAlbumHttpRequest.allDrawingInAlbum(albumID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
        val listDrawingData = arrayListOf<DrawingData>()
        val map = mutableMapOf<Int, DrawingData>()
        coroutineScope {
            (0 until albumDataResponse.length()).map {
                val jsonItemAlbum = albumDataResponse.get(it)
                async(Dispatchers.IO) {
                    val data = IntermediateDrawingServer.drawingInfo(jsonItemAlbum.toString(), albumID)
                    if (data != null ){
                        map[it] = data
                    }
                }
            }.awaitAll()
        }
        map.toSortedMap().forEach { (_, drawingData) -> listDrawingData.add(drawingData) }

        return listDrawingData
    }

    suspend fun deleteDrawing (drawingID: String): Result<Unit>{
        val (_, response, _) = DrawingsInAlbumHttpRequest.deleteDrawing(drawingID)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun createDrawing(drawingName:String, albumID : String) : Result<String>{
        val (_, response, _) = DrawingsInAlbumHttpRequest.createDrawing(drawingName, albumID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return Result.failure(Exception(response.responseMessage))
        val drawingDataResponse = JSONObject(response.data.toString(Charsets.UTF_8))
        return Result.success(drawingDataResponse.getString("drawingID"))
    }

    suspend fun createDrawing(drawingName:String, albumID : String, password: String) : Result<String>{
        val (_, response, _) = DrawingsInAlbumHttpRequest.createDrawing(drawingName, albumID, password)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return Result.failure(Exception(response.responseMessage))
        val drawingDataResponse = JSONObject(response.data.toString(Charsets.UTF_8))
        return Result.success(drawingDataResponse.getString("drawingID"))
    }

    suspend fun verifyPassword(drawingID : String, password :String) : Result<Boolean>{
        val (_, response, _) = DrawingsInAlbumHttpRequest.verifyPassword(drawingID, password)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(response.data.toString(Charsets.UTF_8).toBoolean())
    }

    suspend fun changeDrawingExposition(drawingID : String) : Result<Unit>{
        val (_, response, _) = DrawingsInAlbumHttpRequest.changeDrawingExposition(drawingID)
        if(response.statusCode.toString() != "201") return Result.failure(Exception(response.responseMessage))
        return Result.success(Unit)
    }

    suspend fun allExposedDrawingInAlbum(albumID:String): List<DrawingData>?{
        val (_, response, _) = DrawingsInAlbumHttpRequest.allExposedDrawingInAlbum(albumID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val albumDataResponse = JSONArray(response.data.toString(Charsets.UTF_8))
        val listDrawingData = arrayListOf<DrawingData>()
        val map = mutableMapOf<Int, DrawingData>()
        coroutineScope {
            (0 until albumDataResponse.length()).map {
                val jsonItemAlbum = albumDataResponse.get(it)
                async(Dispatchers.IO) {
                    val data = IntermediateDrawingServer.drawingInfo(jsonItemAlbum.toString(), albumID)
                    if (data != null ){
                        map[it] = data
                    }
                }
            }.awaitAll()
        }
        map.toSortedMap().forEach { (_, drawingData) -> listDrawingData.add(drawingData) }
        return  listDrawingData
    }
}
