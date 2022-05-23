package com.client_leger.colorimage.Avatar

import android.graphics.Bitmap
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Constants.Constants
import org.json.JSONArray
import java.io.ByteArrayOutputStream
import java.io.File

object Avatar {

    private var defaultAvatarList:JSONArray? = null

    suspend fun fetchAvatarDefaultList():Boolean{
        val (_, avatarListResponse, _) = UsersHttpRequest.allDefaultAvatar()
        if(avatarListResponse.statusCode.toString() != Constants.SUCCES_STATUS) return false
        val dataResponse = JSONArray(avatarListResponse.data.toString(Charsets.UTF_8))
        setAvatarList(dataResponse)
        return true
    }

    private fun setAvatarList(dataResponse: JSONArray){
        defaultAvatarList = dataResponse
    }

    fun getAvatarName(position: Int): Any? {
        return defaultAvatarList?.get(position)
    }

    fun getAvatarList(): JSONArray? {
        return defaultAvatarList
    }

    fun clearAvatarList(){
        defaultAvatarList = JSONArray()
    }

    fun generateJpeg(bitmap: Bitmap): File {
        val file : File = File.createTempFile("file", ".png")
        val imageOutput = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 0, imageOutput)
        file.writeBytes(imageOutput.toByteArray())
        return file
    }



}
