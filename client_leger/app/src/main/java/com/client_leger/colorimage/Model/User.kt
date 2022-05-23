package com.client_leger.colorimage.Model


import android.content.Context
import com.client_leger.colorimage.Api.Connexion.ConnexionHttpRequest
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Model.UserData.UserData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File




object User {

    private lateinit var username:String
    private lateinit var email:String
    private lateinit var id:String
    private var userAuthenticated: Boolean = false
    private var loginHistory: JSONArray? = null
    var hasBeenDisconnected: Boolean = false
    private var disconnectHistory: JSONArray? = null
    private var isEmailProtected: Boolean = false

    fun setUsername(username:String){
        User.username = username
    }

    fun getUsername():String{
        return username
    }

    fun userIsAuthenticated():Boolean{
        return User.userAuthenticated
    }

    fun setUserAuthenticationStatus(status: Boolean){
        User.userAuthenticated = status
    }

    fun setEmail(email:String){
        User.email = email
    }

    fun getEmail():String{
        return email
    }

    fun setId(id:String){
        User.id = id
    }

    fun getId():String{
        return id
    }

    suspend fun setUserInfo():Boolean{
        val (_, userResponse, _) = UsersHttpRequest.userData()
        val userDataResponse = JSONObject(userResponse.data.toString(Charsets.UTF_8))

        return if(userResponse.statusCode.toString() != Constants.USER_SUCCES_STATUS){
            false
        } else{
            setUsername(userDataResponse.getString("username").toString())
            setEmail(userDataResponse.getString("email").toString())
            setId(userDataResponse.getString("_id").toString())
            setEmailProtection(userDataResponse.getBoolean("isEmailProtected"))
            true
        }
    }

    suspend fun setDefaultAvatar(defaultAvatarName: String): Boolean{
        val (_, response, _) = UsersHttpRequest.changeToDefaultAvatar(defaultAvatarName)
        return response.statusCode.toString() == Constants.SUCCES_STATUS
    }

    suspend fun setAvatar(file: File): Boolean{
        val (_, response, _) = UsersHttpRequest.changeAvatar(file)
        return response.statusCode.toString() == Constants.SUCCES_STATUS
    }

    fun getAvatar(): String{
        return Constants.USER_AVATAR_URL + User.username
    }

    fun setEmailProtection(isEmailProtected:Boolean){
        User.isEmailProtected = isEmailProtected
    }

    fun getEmailProtection():Boolean{
        return isEmailProtected
    }

    suspend fun requestEmailProtection():Boolean{
        val(_, response, _) = ConnexionHttpRequest.changeEmailProtection()
        return response.statusCode.toString() == Constants.SUCCES_STATUS
    }

    suspend  fun fetchLoginHistory():JSONArray?{
        val (_, response, _) = UsersHttpRequest.userLoginTime()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            User.loginHistory = null
            return null
        }
        User.loginHistory = JSONArray(response.data.toString(Charsets.UTF_8))
        return User.loginHistory
    }

    fun getLastLogin(): String? {
        if(User.loginHistory != null) {
            val position = User.loginHistory!!.length() - 1
            val date = User.loginHistory!![position]
            return Timestamp.dateToHourDate(Timestamp.stringToDate(date as String))
        }
        return null
    }

    fun getLoginHistory(): JSONArray? {
        return User.loginHistory
    }

    suspend fun fetchDisconnectTime(): Boolean{
        val (_, response, _) = UsersHttpRequest.userDisconnectTime()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            User.disconnectHistory = null
            return false
        }
        User.disconnectHistory = JSONArray(response.data.toString(Charsets.UTF_8))
        return true
    }

    fun getDisconnectHistory(): JSONArray? {
        return User.disconnectHistory
    }

    suspend fun fetchUserTotalCollaborationTime(): String{
        val (_, response, _) = UsersHttpRequest.userTotalCollaborationTime()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return "0"
        }
        return response.data.toString(Charsets.UTF_8)
    }

    suspend fun fetchUserAverageCollaborationTime(): String{
        val (_, response, _) = UsersHttpRequest.userAverageCollaborationTime()
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return "0"
        }
        return response.data.toString(Charsets.UTF_8)
    }

    suspend fun isAuthorized():Boolean{
        val (_, response, _) = UsersHttpRequest.userData()
        if(response.statusCode.toString() == Constants.UNAUTHORIZED_STATUS){
            User.hasBeenDisconnected
            return false
        }
        return true
    }

    suspend fun disconnect(){
        val (_, response, _) = ConnexionHttpRequest.logout()
        if(response.statusCode.toString() != Constants.LOGOUT_SUCCES_STATUS){
            User.username = ""
            User.email = ""
            User.id= ""
            User.userAuthenticated = false
        }
        UnreadMessageTracker.stopUnreadMonitoring()
    }

    suspend fun getUserInfoById(id:String):UserData?{
        val (_, response, _) = UsersHttpRequest.getUserInfoById(id)
        if(response.statusCode.toString() != Constants.SUCCES_STATUS){
            return null
        }
        val responseObject = JSONObject(response.data.toString(Charsets.UTF_8))
        val username = responseObject.getString("username").toString()
        val isEmailProtected = responseObject.getString("isEmailProtected").toBoolean()
        val email = when(isEmailProtected){
            true -> ""
            else -> responseObject.getString("email").toString()
        }
        return UserData(username, isEmailProtected, email)
    }

    suspend fun numberOfPixelCrossUser(): String{
        val (_, response, _) = UsersHttpRequest.numberOfPixelCrossUser()
        return if(response.statusCode.toString() != Constants.SUCCES_STATUS) "0"
        else try {
            response.data.toString(Charsets.UTF_8).toString()
        } catch (e: JSONException){
            "0"
        }
    }

    suspend fun numberOfMessageSentUser(): String{
        val (_, response, _) = UsersHttpRequest.numberOfMessageSentUser()
        return if(response.statusCode.toString() != Constants.SUCCES_STATUS) "0"
        else try {
            response.data.toString(Charsets.UTF_8).toString()
        } catch (e: JSONException){
            "0"
        }
    }

}
