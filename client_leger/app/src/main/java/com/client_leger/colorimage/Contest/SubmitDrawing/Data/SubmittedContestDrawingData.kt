package com.client_leger.colorimage.Contest.SubmitDrawing.Data

import android.graphics.Bitmap
import java.util.*

data class SubmittedContestDrawingData(
    val imageBitmap: Bitmap,
    val theme: String,
    val date: Date,
    val drawingName: String,
    val vote: String,
)
