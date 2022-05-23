package com.client_leger.colorimage.drawing.data

import com.client_leger.colorimage.Constants.Constants
import java.sql.Date

data class CommandFromServer(
    val timestamp: String,
    val userID : String,
    val commandNumber : Int,
    val commandData : CommandToServer )
