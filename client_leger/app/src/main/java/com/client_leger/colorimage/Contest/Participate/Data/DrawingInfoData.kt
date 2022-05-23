package com.client_leger.colorimage.Contest.Participate.Data

import android.graphics.Bitmap

data class DrawingInfoData(
    val drawingName:String,
    val drawingBitmap: Bitmap,
    val id: String,
    var isSelected: Boolean,
)
