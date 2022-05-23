package com.client_leger.colorimage.drawing.data

data class ChangeCommandFromClient(
    val commandID: String,
    val commandFromClient: CommandToServer
): CommandData()
