package com.client_leger.colorimage.Contest.CurrentContest.Data

import android.graphics.Bitmap

data class PlayerData(
    val username: String,
    val imageBitmap: Bitmap,
    val drawingName: String,
    val vote: String,
)
