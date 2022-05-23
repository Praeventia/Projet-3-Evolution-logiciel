package com.client_leger.colorimage.drawing.data

data class SwitchCommandFromClient(
    val commandPosition : Int,
    val newPosition : Int
) : CommandData()
