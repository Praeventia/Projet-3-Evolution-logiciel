package com.client_leger.colorimage.Contest.Participate.Intermediate

import com.client_leger.colorimage.Api.Contest.ContestHttpRequest
import com.client_leger.colorimage.Api.Drawing.DrawingHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.Participate.Data.DrawingInfoData
import com.client_leger.colorimage.Model.DrawingDecoder
import org.json.JSONArray
import org.json.JSONObject

object IntermediateParticipateContestServer {

    suspend fun getMyDrawingsID():JSONArray?{
        var (_, response, _) = DrawingHttpRequest.allDrawingsOwnByUser()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }
        else{
            return JSONArray(response.data.toString(Charsets.UTF_8))
        }
    }

    suspend fun uploadConcoursEntry(drawingId:String): Boolean{
        val (_, response, _) = ContestHttpRequest.uploadConcoursEntry(drawingId)
        return response.statusCode.toString() == Constants.SUCCES_STATUS
    }

    suspend fun setDrawingInfo(allDrawings: JSONArray): ArrayList<DrawingInfoData>? {
        val list = ArrayList<DrawingInfoData>()
        if(allDrawings.length() == 0) return null
        for(i in 0 until allDrawings.length()) {
            val (_, response, _) = DrawingHttpRequest.drawingInfo(allDrawings[i] as String)
            if(response.statusCode.toString() != Constants.SUCCES_STATUS) {
                return null
            }
            val responseData = JSONObject(response.data.toString(Charsets.UTF_8))
            val bitmapImage = DrawingDecoder.byteArrayToBitmap(allDrawings[i] as String)
            val drawingName = responseData.getString("drawingName").toString()
            list += DrawingInfoData(drawingName, bitmapImage!!, allDrawings[i].toString(), false)
        }
        return list
    }

    suspend fun userCanStillPublishEntry():Boolean?{
        val (_, response, _) = ContestHttpRequest.userCanStillPublishEntry()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }
        return response.data.toString(Charsets.UTF_8) == "true"
    }


}
