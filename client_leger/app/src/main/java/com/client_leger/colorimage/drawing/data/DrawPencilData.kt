package com.client_leger.colorimage.drawing.data

data class DrawPencilData(
    val pathData : List<Vec2>,
    val color : String,
    val size : Int,
) : CommandData()
