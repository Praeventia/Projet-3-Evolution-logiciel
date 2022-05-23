package com.client_leger.colorimage.drawing.data

data class DrawRectangleData(
    val strokeColor : String,
    val fillColor: String,
    val size : Int,
    val withStroke: Boolean,
    val withFill : Boolean,
    val beginning: Vec2,
    val end: Vec2,
    val isEven: Boolean,
    val text: String?,
    val textColor: String?
) : CommandData()
