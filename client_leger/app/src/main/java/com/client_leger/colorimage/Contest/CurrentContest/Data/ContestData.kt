package com.client_leger.colorimage.Contest.CurrentContest.Data

import java.util.*

data class ContestData(
    val theme:String,
    val startDate: Date,
    val endDate: Date,
    val podium: PodiumData?
)
