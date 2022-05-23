package com.client_leger.colorimage.Profile.Slider.data

import android.graphics.Bitmap
import java.util.*

data class DrawingSliderData(
    val imageView:Bitmap,
    val drawingTitle: String,
    val ownerName:String,
    val numberPeople: String,
    val creationDate: Date,
    val locker: Boolean,
    val drawingID:String
)
