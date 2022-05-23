package com.client_leger.colorimage.Contest.CurrentContest.Intermediate

import com.client_leger.colorimage.Api.Contest.ContestHttpRequest
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.CurrentContest.Data.ContestData
import com.client_leger.colorimage.Contest.CurrentContest.Data.PlayerData
import com.client_leger.colorimage.Contest.CurrentContest.Data.PodiumData
import com.client_leger.colorimage.Contest.CurrentContest.Data.WeekContestData
import com.client_leger.colorimage.Model.DrawingDecoder
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

object ContestServer {

    suspend fun topEntryCurrentConcours(): ArrayList<ContestData>?{
        val list = ArrayList<ContestData>()
        val playerList = ArrayList<PlayerData>()
        val (_, response, _) = ContestHttpRequest.topEntryCurrentConcours()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }
        try{
            val responseData = JSONObject(response.data.toString(Charsets.UTF_8))
            val winnerData = JSONArray(responseData.getString("winner").toString())
            if(winnerData.length() == 0) return null
            for(i in 0 until winnerData.length()) {
                val ownerInfo = User.getUserInfoById((JSONObject(winnerData[i].toString()).getString("ownerID").toString())) ?: return null
                val drawingId = JSONObject(winnerData[i].toString()).getString("_id").toString()
                val imageBitmap = DrawingDecoder.byteArrayToBitmapContest(drawingId)
                val drawingName = JSONObject(winnerData[i].toString()).getString("drawingName").toString()
                val vote = JSONObject(winnerData[i].toString()).getString("vote").toString()
                playerList += PlayerData(ownerInfo.username, imageBitmap!!, drawingName, vote)
            }
            val podium = generatePodium(playerList) ?: return null
            val weekContestInfo = JSONObject(responseData.getString("concoursWeek").toString())
            val theme = weekContestInfo.getString("theme").toString()
            val startDate = Timestamp.stringToDate(weekContestInfo.getString("startDate").toString())
            val endDate = Timestamp.stringToDate(weekContestInfo.getString("endDate").toString())
            list.add(ContestData(theme, startDate, endDate, podium))
            return list
        } catch(e: JSONException){
            return null
        }
    }

    private fun generatePodium(playerList:ArrayList<PlayerData>): PodiumData?{
        return when(playerList.size){
            1 -> PodiumData(playerList[0], null, null)
            2 -> PodiumData(playerList[0], playerList[1], null)
            3 -> PodiumData(playerList[0], playerList[1], playerList[2])
            else -> null
        }
    }

    suspend fun topEntryPastConcours(): ArrayList<ContestData>?{
        val list = ArrayList<ContestData>()
        val contestList = mutableMapOf<Int, ContestData>()
        val dataArray = ArrayList<JSONObject>()
        val (_, response, _) = ContestHttpRequest.topEntryPastConcours()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }
        try {
            val responseDataArray = JSONArray(response.data.toString(Charsets.UTF_8))
            for (i in 0 until responseDataArray.length()) {
                val responseData: JSONObject = responseDataArray[i] as JSONObject
                val winnerData = JSONArray(responseData.getString("winner").toString())
                if (winnerData.length() == 0) continue
                else dataArray += responseData
            }

            (0 until dataArray.size).map { it ->
                val playerList = mutableMapOf<Int,PlayerData>()
                val winnerData = JSONArray(dataArray[it].getString("winner").toString())
                println("-------------------------------------")
                coroutineScope {
                    (0 until winnerData.length()).map { winIt ->
                        val winner = winnerData.get(winIt)
                        async(Dispatchers.IO) {
                            println(User.getUserInfoById(
                                (JSONObject(winner.toString()).getString("ownerID").toString())
                            ))

                            val ownerInfo = User.getUserInfoById(
                                (JSONObject(winner.toString()).getString("ownerID").toString())
                            ) ?: return@async null
                            val drawingId = JSONObject(winner.toString()).getString("_id").toString()
                            val imageBitmap = DrawingDecoder.byteArrayToBitmapContest(drawingId)
                            val drawingName =
                                JSONObject(winner.toString()).getString("drawingName").toString()
                            val vote = JSONObject(winner.toString()).getString("vote").toString()
                            playerList[winIt] = PlayerData(
                                ownerInfo.username,
                                imageBitmap!!,
                                drawingName,
                                vote
                            )
                        }
                    }.awaitAll()
                }

                val playerWinnerList = ArrayList<PlayerData>()
                playerList.toSortedMap().forEach { (_, value) -> playerWinnerList.add(value) }
                val podium = generatePodium(playerWinnerList)
                val weekContestInfo = JSONObject(dataArray[it].getString("concoursWeek").toString())
                val theme = weekContestInfo.getString("theme").toString()
                val startDate = Timestamp.stringToDate(weekContestInfo.getString("startDate").toString())
                val endDate = Timestamp.stringToDate(weekContestInfo.getString("endDate").toString())
                contestList[it] = ContestData(theme, startDate, endDate, podium)
            }

            contestList.toSortedMap(reverseOrder()).forEach { (_, value) -> list.add(value) }
            return list
        } catch(e: JSONException){
            return null
        }
    }

}
