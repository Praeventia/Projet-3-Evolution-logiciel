package com.client_leger.colorimage.drawing.intermediate

import com.client_leger.colorimage.Api.Drawing.DrawingHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Model.DrawingDecoder
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.Profile.Slider.data.DrawingSliderData
import com.client_leger.colorimage.album.data.DrawingData
import com.client_leger.colorimage.album.data.UserData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import kotlin.collections.ArrayList

object IntermediateDrawingServer {

    suspend fun drawingInfo(drawingID : String, albumID : String) : DrawingData?{
        val (_, response, _) = DrawingHttpRequest.drawingInfo(drawingID)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val numberConnectedUser = numberConnectedUserInDrawing(drawingID)
        val bitmap = DrawingDecoder.byteArrayToBitmap(drawingID)
        val drawingDataResponse = JSONObject(response.data.toString(Charsets.UTF_8))
        return DrawingData(
            drawingDataResponse.getString("drawingName"),
            drawingID,
            IntermediateAlbumServer.getInfoUser(drawingDataResponse.getString("owner"))?.userName!!,
            userIsOwnerOfDrawing(drawingID)!!,
            drawingDataResponse.getString("creationDate").slice(IntRange(0,9)),
            numberConnectedUser?.toString() ?: "0",
            albumID,
            drawingDataResponse.getBoolean("isPasswordProtected"),
            drawingDataResponse.getBoolean("isExposed"),
            bitmap
        )
    }

    suspend fun userIsOwnerOfDrawing(drawingID: String) : Boolean?{
        val (_, response, _) = DrawingHttpRequest.userIsOwnerOfDrawing(drawingID)
        if (response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        return response.data.toString(Charsets.UTF_8).toBoolean()
    }

    suspend fun allCommandsInDrawing(drawingID: String): List<JSONObject>? {
        val (_, response, _) = DrawingHttpRequest.allCommandsInDrawing(drawingID)
        if (response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val allCommandData = JSONArray(response.data.toString(Charsets.UTF_8))
        return List(allCommandData.length()){
            allCommandData.getJSONObject(it)
        }
    }

    suspend fun allCommandsSelected(drawingID: String): List<Map<String,String>>?{
        val (_, response, _) = DrawingHttpRequest.allCommandsSelected(drawingID)
        if (response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val allCommandData = JSONArray(response.data.toString(Charsets.UTF_8))
        return List(allCommandData.length()){
            mapOf(allCommandData.getJSONObject(it).get("commandID").toString() to allCommandData.getJSONObject(it).get("userID").toString())
        }
    }

    suspend fun connectedUserInDrawing(drawingID : String) : List<UserData>? {
        val (_, response, _) = DrawingHttpRequest.connectedUserInDrawing(drawingID)
        if (response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val connectedUserInDrawing = JSONArray(response.data.toString(Charsets.UTF_8))
        val listUserData = arrayListOf<UserData>()
        val map = mutableMapOf<Int, UserData>()
        coroutineScope {
            (0 until connectedUserInDrawing.length()).map {
                val jsonItemAlbum = connectedUserInDrawing.get(it)
                async(Dispatchers.IO) {
                    val data = IntermediateAlbumServer.getInfoUser(jsonItemAlbum.toString())
                    if (data != null ){
                        map[it] = data
                    }
                }
            }.awaitAll()
        }
        map.toSortedMap().forEach { (_, drawingData) -> listUserData.add(drawingData) }
        return listUserData
    }

    private suspend fun numberConnectedUserInDrawing(drawingID : String) : Int? {
        val (_, response, _) = DrawingHttpRequest.connectedUserInDrawing(drawingID)
        if (response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        val connectedUserInDrawing = JSONArray(response.data.toString(Charsets.UTF_8))
        return connectedUserInDrawing.length()
    }

    suspend fun getNumberOfDrawingsContributed(): String?{
        val (_, response, _) = DrawingHttpRequest.allDrawingsContributed()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        return JSONArray(response.data.toString(Charsets.UTF_8)).length().toString()
    }

    suspend fun getIdOfAllDrawingsContributed(): JSONArray?{
        val (_, response, _) = DrawingHttpRequest.allDrawingsContributed()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        return JSONArray(response.data.toString(Charsets.UTF_8))
    }

    suspend fun getIdOfAllDrawingsOwnByUser(): JSONArray?{
        val (_, response, _) = DrawingHttpRequest.allDrawingsOwnByUser()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        return JSONArray(response.data.toString(Charsets.UTF_8))
    }

    suspend fun getNumberOfDrawingsOwn(): String?{
        val (_, response, _) = DrawingHttpRequest.allDrawingsOwnByUser()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        return JSONArray(response.data.toString(Charsets.UTF_8)).length().toString()
    }

    suspend fun recentDrawingsSlider(): ArrayList<DrawingSliderData>?{
        val list = ArrayList<DrawingSliderData>()
        val (_, response, _) = DrawingHttpRequest.recentDrawingEdited()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS) return null
        try{
            val drawingSlider = JSONArray(response.data.toString(Charsets.UTF_8))
            val sliderList = mutableMapOf<Int, DrawingSliderData>()
            coroutineScope {
                (0 until drawingSlider.length()).map { it ->
                    val jsonObject = drawingSlider.getJSONObject(it)
                    val drawingID = jsonObject.getString("_id").toString()
                    async(Dispatchers.IO) {
                        val drawing = drawingInfo(drawingID, "")
                        if(drawing != null) {
                            val owner = drawing.owner
                            val timestamp = Timestamp.stringToDate(
                                jsonObject.getString("lastEditionDate").toString()
                            )
                            val imageBitmap = DrawingDecoder.byteArrayToBitmap(drawingID)!!
                            val drawingSlider = DrawingSliderData(
                                imageBitmap,
                                drawing.drawingName,
                                owner,
                                drawing.numberOfPeopleEditing,
                                timestamp,
                                drawing.needPassword,
                                drawingID
                            )
                            sliderList[it] = drawingSlider
                        }
                    }
                }.awaitAll()
            }
            sliderList.toSortedMap().forEach { (_, value) -> list.add(value) }
            return list
        }catch (e:JSONException){
            return null
        }
    }
}
