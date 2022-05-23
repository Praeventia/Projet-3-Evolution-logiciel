package com.client_leger.colorimage.Contest.SubmitDrawing.Intermediate

import com.client_leger.colorimage.Api.Contest.ContestHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.SubmitDrawing.Data.SubmittedContestDrawingData
import com.client_leger.colorimage.Model.DrawingDecoder
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.Model.User
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

object SubmitContestDrawingServer {

    suspend fun allPastEntryByUser(): ArrayList<SubmittedContestDrawingData>?{
        val (_, response, _) = ContestHttpRequest.allPastEntryByUser()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else{
            try {
                val list = ArrayList<SubmittedContestDrawingData>()
                val responseData = JSONArray(response.data.toString(Charsets.UTF_8))
                if (responseData.length() == 0) return null
                for (i in 0 until responseData.length()) {
                    val id = JSONObject(responseData[i].toString()).getString("_id").toString()
                    val bitmapImage = DrawingDecoder.byteArrayToBitmapContest(id) ?: return null
                    val drawingName = JSONObject(responseData[i].toString()).getString("drawingName").toString()
                    val vote = JSONObject(responseData[i].toString()).getString("vote").toString()
                    val date = Timestamp.stringToDate(JSONObject(responseData[i].toString()).getString("creationDate").toString())
                    val weekId = JSONObject(responseData[i].toString()).getString("concoursWeekID").toString()
                    val theme = getContestTheme(weekId)
                    val submittedContestDrawingData = SubmittedContestDrawingData(
                        bitmapImage,
                        theme,
                        date,
                        drawingName,
                        vote,
                    )
                    list += submittedContestDrawingData
                }
                return list
            }catch(e:JSONException){
                return null
            }
        }
    }

    suspend fun getCurrentEntryByUser(): ArrayList<SubmittedContestDrawingData>?{
        val (_, response, _) = ContestHttpRequest.currentEntryByUser()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else{
            try {
                val list = ArrayList<SubmittedContestDrawingData>()
                val responseData = JSONObject(response.data.toString(Charsets.UTF_8))
                val id = responseData.getString("_id").toString()
                val bitmapImage = DrawingDecoder.byteArrayToBitmapContest(id) ?: return null
                val drawingName = responseData.getString("drawingName").toString()
                val vote = responseData.getString("vote").toString()
                val date = Timestamp.stringToDate(JSONObject(responseData.toString()).getString("creationDate").toString())
                val weekId = JSONObject(responseData.toString()).getString("concoursWeekID").toString()
                val theme = getContestTheme(weekId)
                val submittedContestDrawingData = SubmittedContestDrawingData(
                    bitmapImage,
                    theme,
                    date,
                    drawingName,
                    vote,
                )
                list.add(submittedContestDrawingData)
                return list
            }catch (e: JSONException){
                return null
            }
        }
    }

    suspend fun getContestTheme(id:String):String{
        val (_, response, _) = ContestHttpRequest.weekInfo(id)
        return if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            ""
        }else{
            try {
                val responseData = JSONObject(response.data.toString(Charsets.UTF_8))
                responseData.getString("theme").toString()
            } catch (e: JSONException){
                ""
            }
        }
    }

}
