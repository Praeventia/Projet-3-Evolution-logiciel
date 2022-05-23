package com.client_leger.colorimage.Leaderboard.data.Intermediate

import com.client_leger.colorimage.Api.Leaderboard.LeaderboardHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Leaderboard.data.LeaderboardData
import org.json.JSONArray
import org.json.JSONObject

object ServerLeaderboard {
    suspend fun mostMessageSent():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostMessageSent()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Messages envoyés",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostTotalEditionTime():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostTotalEditionTime()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Temps d'édition total",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostPixelCross():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostPixelCross()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Pixels croisés",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostLineCount():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostLineCount()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de lignes",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostShapeCount():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostShapeCount()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de formes",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostRecentLogin():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostRecentLogin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Connexion la plus récente",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostOldLogin():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostOldLogin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Connexion la plus ancienne",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostLogin():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostLogin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de connexion",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostDisconnect():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostDisconnect()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de déconnexion",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }


    suspend fun mostAverageCollaborationTime():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostAverageCollaborationTime()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Temps de collaboration moyen",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostRoomJoin():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostRoomJoin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de salle rejoint",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostAlbumJoin():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostAlbumJoin()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre d'albums rejoint",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostDrawingContributed():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostDrawingContributed()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de Contribution à un dessin",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostVote():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostVote()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de vote",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
    suspend fun mostConcoursEntry():LeaderboardData?{
        val (_, response, _) = LeaderboardHttpRequest.mostConcoursEntry()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }else {
            val leaderboard = JSONArray(response.data.toString(Charsets.UTF_8))
            var firstUsername: String? = null
            var secondUsername: String?  = null
            var thirdUsername: String?  = null

            when(leaderboard.length()){
                0 -> {
                    return null
                }
                1 -> {
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                }
                2->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                }
                3->{
                    firstUsername = JSONObject(leaderboard[0].toString()).getString("username").toString()
                    secondUsername = JSONObject(leaderboard[1].toString()).getString("username").toString()
                    thirdUsername = JSONObject(leaderboard[2].toString()).getString("username").toString()
                }
            }
            return LeaderboardData(
                "Nombre de participation aux concours",
                Constants.USER_AVATAR_URL + firstUsername,
                firstUsername,
                Constants.USER_AVATAR_URL + secondUsername,
                secondUsername,
                Constants.USER_AVATAR_URL + thirdUsername,
                thirdUsername,
            )
        }
    }
}
