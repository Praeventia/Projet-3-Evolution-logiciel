package com.client_leger.colorimage.album.data

import android.graphics.Bitmap


data class DrawingData(
    val drawingName : String = "",
    val drawingId : String = "",
    val owner : String = "",
    val isOwner : Boolean = false,
    val creationDate: String = "",
    val numberOfPeopleEditing : String = "",
    val albumId : String = "",
    val needPassword : Boolean = false,
    var isExposed : Boolean = false,
    val bitmap: Bitmap? = null
)
