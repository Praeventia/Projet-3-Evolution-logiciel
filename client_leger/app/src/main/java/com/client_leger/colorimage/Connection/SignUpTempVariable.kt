package com.client_leger.colorimage.Connection

import android.graphics.Bitmap
import com.client_leger.colorimage.Model.User
import java.io.*

object SignUpTempVariable {
    private var imageBitmap: Bitmap? = null
    private var tempDefaultImage: String? = null
    private var imageSetOnce : Boolean = false
    private var username: String? = null
    private var email: String? = null
    private var password: String? = null


    fun setImageBitmap(image: Bitmap){
        SignUpTempVariable.imageBitmap = image
        SignUpTempVariable.tempDefaultImage = null
    }

    fun getImageBitmap(): Bitmap? {
        return SignUpTempVariable.imageBitmap
    }

    fun setTempDefaultImage(name: String){
        SignUpTempVariable.imageBitmap = null
        SignUpTempVariable.tempDefaultImage = name
    }

    fun getTempDefaultImage(): String? {
        return SignUpTempVariable.tempDefaultImage
    }

    fun clearTempImages(){
        SignUpTempVariable.imageBitmap = null
        SignUpTempVariable.tempDefaultImage = null
        SignUpTempVariable.imageSetOnce = false
    }

    fun getImageSetOnce():Boolean{
        return SignUpTempVariable.imageSetOnce
    }

    fun setImageSetOnce(value: Boolean){
        SignUpTempVariable.imageSetOnce = value
    }

    fun saveUserInfo(username: String, email:String, password:String){
        SignUpTempVariable.username = username
        SignUpTempVariable.email = email
        SignUpTempVariable.password = password
    }

    fun clearUserInfo(){
        SignUpTempVariable.username = null
        SignUpTempVariable.email = null
        SignUpTempVariable.password = null
    }

    fun getUsername(): String? {
        return SignUpTempVariable.username
    }

    fun getEmail(): String? {
        return SignUpTempVariable.email
    }

    fun getPassword(): String? {
        return SignUpTempVariable.password
    }
}
