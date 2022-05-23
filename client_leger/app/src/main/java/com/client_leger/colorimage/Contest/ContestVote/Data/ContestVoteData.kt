package com.client_leger.colorimage.Contest.ContestVote.Data

import android.graphics.Bitmap

data class ContestVoteData (
    val drawingName: String,
    val username: String,
    var hasAlreadyUpVoted: Boolean,
    var hasAlreadyDownVoted: Boolean,
    var vote: String,
    val drawingBitmap: Bitmap,
    val id: String,
)
