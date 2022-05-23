package com.client_leger.colorimage.Contest.ContestVote.Intermediate

import com.client_leger.colorimage.Api.Contest.ContestHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.ContestVote.Data.ContestVoteData
import com.client_leger.colorimage.Contest.ContestVote.Data.VoteUpdateData
import com.client_leger.colorimage.Model.DrawingDecoder
import com.client_leger.colorimage.Model.User
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject


object ServerContestVote {

    suspend fun allEntryCurrentConcours(): ArrayList<ContestVoteData>?{
        val list = ArrayList<ContestVoteData>()
        val (_,response,_) = ContestHttpRequest.allEntryCurrentConcours()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else{
            try {
                val responseData = JSONArray(response.data.toString(Charsets.UTF_8))
                if(responseData.length() == 0) return null
                for(i in 0 until responseData.length()) {
                    val drawingName = JSONObject(responseData[i].toString()).getString("drawingName").toString()
                    var ownerInfo = User.getUserInfoById((JSONObject(responseData[i].toString()).getString("ownerID").toString())) ?: return null
                    val hasAlreadyUpVoted = JSONObject(responseData[i].toString()).getString("hasAlreadyUpVoted").toBoolean()
                    val hasAlreadyDownVoted = JSONObject(responseData[i].toString()).getString("hasAlreadyDownVoted").toBoolean()
                    val vote = JSONObject(responseData[i].toString()).getString("vote").toString()
                    val drawingId = JSONObject(responseData[i].toString()).getString("_id").toString()
                    val imageBitmap = DrawingDecoder.byteArrayToBitmapContest(drawingId)?: return null
                    list += ContestVoteData(drawingName, ownerInfo.username, hasAlreadyUpVoted, hasAlreadyDownVoted, vote, imageBitmap, drawingId)
                }
            }catch (e:JSONException){
                return null
            }
        }
        return list
    }

    suspend fun numberOfUpVoteThisWeekByUser(): Int?{
        val (_,response,_) = ContestHttpRequest.numberOfUpVoteThisWeekByUser()
        return try{
            if(response.statusCode.toString() != Constants.SUCCES_STATUS){
                null
            }else {
                val responseData = (response.data.toString(Charsets.UTF_8)).toInt()
                Constants.MAX_NUMBER_VOTES - responseData
            }
        }catch (e: JSONException){
            null
        }

    }

    suspend fun voteForEntry(id:String): Pair<Boolean, String>{
        val(_,response,_) = ContestHttpRequest.upvoteForEntry(id)
        return try{
            when(response.statusCode.toString()){
                Constants.VOTE_SUCCES_STATUS -> Pair(true, Constants.VOTE_SUCCES_STATUS)
                Constants.CONFLICT_STATUS -> Pair(false, Constants.CONFLICT_STATUS)
                else -> Pair(false, "")
            }
        } catch (e: JSONException){
            Pair(false, "")
        }
    }

    suspend fun unupvoteForEntry(id:String): Pair<Boolean, String>{
        val(_,response,_) = ContestHttpRequest.unupvoteForEntry(id)
        return try{
            when(response.statusCode.toString()){
                Constants.VOTE_SUCCES_STATUS -> Pair(true, Constants.VOTE_SUCCES_STATUS)
                Constants.CONFLICT_STATUS -> Pair(false, Constants.CONFLICT_STATUS)
                else -> Pair(false, "")
            }
        } catch (e: JSONException){
            Pair(false, "")
        }
    }

    suspend fun downvoteForEntry(id:String): Pair<Boolean, String>{
        val(_,response,_) = ContestHttpRequest.downvoteForEntry(id)
        return try{
            when(response.statusCode.toString()){
                Constants.VOTE_SUCCES_STATUS -> Pair(true, Constants.VOTE_SUCCES_STATUS)
                Constants.CONFLICT_STATUS -> Pair(false, Constants.CONFLICT_STATUS)
                else -> Pair(false, "")
            }
        } catch (e: JSONException){
            Pair(false, "")
        }
    }

    suspend fun undownvoteForEntry(id:String): Pair<Boolean, String>{
        val(_,response,_) = ContestHttpRequest.undownvoteForEntry(id)
        return try{
            when(response.statusCode.toString()){
                Constants.VOTE_SUCCES_STATUS -> Pair(true, Constants.VOTE_SUCCES_STATUS)
                Constants.CONFLICT_STATUS -> Pair(false, Constants.CONFLICT_STATUS)
                else -> Pair(false, "")
            }
        } catch (e: JSONException){
            Pair(false, "")
        }
    }

    suspend fun updateItemInList(position: Int): VoteUpdateData?{
        val (_,response,_) = ContestHttpRequest.allEntryCurrentConcours()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else{
            try {
                val responseData = JSONArray(response.data.toString(Charsets.UTF_8))
                if (responseData.length() == 0) return null
                val hasAlreadyUpVoted = JSONObject(responseData[position].toString()).getString("hasAlreadyUpVoted").toBoolean()
                val hasAlreadyDownVoted = JSONObject(responseData[position].toString()).getString("hasAlreadyDownVoted").toBoolean()
                val vote = JSONObject(responseData[position].toString()).getString("vote").toString()
                return VoteUpdateData(hasAlreadyUpVoted, hasAlreadyDownVoted, vote)
            }catch (e:JSONException){
                return null
            }
        }
    }

    suspend fun userCanStillVote(): Pair<Boolean, String>{
        val (_,response,_) = ContestHttpRequest.userCanStillUpVote()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return Pair(false, response.statusCode.toString())
        }else{
            try {
                val responseData = response.data.toString(Charsets.UTF_8).toBoolean()
                return Pair(responseData, "succes")
            }catch (e:JSONException){
                return Pair(false, response.statusCode.toString())
            }
        }
    }
}

