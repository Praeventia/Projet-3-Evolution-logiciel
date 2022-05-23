package com.client_leger.colorimage.Contest.Data.Intermediate

import com.client_leger.colorimage.Api.Contest.ContestHttpRequest
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.Data.WeekContestData
import com.client_leger.colorimage.Model.Timestamp
import org.json.JSONArray
import org.json.JSONObject

object ContestServer {

    suspend fun userCanStillPublishEntry(): Boolean{
        val (_, response, _) = ContestHttpRequest.userCanStillPublishEntry()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return false
        }
        return response.data.toString(Charsets.UTF_8) == "true"
    }

    suspend fun allEntryCurrentConcours(){
        val (_, response, _) = ContestHttpRequest.allEntryCurrentConcours()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){

        }
        print("----------------------")
        println(JSONArray(response.data.toString(Charsets.UTF_8)))
    }

    suspend fun currentConcoursInfo():WeekContestData?{
        val (_, response, _) = ContestHttpRequest.currentConcoursInfo()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }
        val responseData = JSONObject(response.data.toString(Charsets.UTF_8))
        return WeekContestData(
            responseData.getString("_id").toString(),
            Timestamp.stringToDate(responseData.getString("endDate").toString()),
            Timestamp.stringToDate(responseData.getString("startDate").toString()),
            responseData.getString("theme").toString(),
            )

    }


}
