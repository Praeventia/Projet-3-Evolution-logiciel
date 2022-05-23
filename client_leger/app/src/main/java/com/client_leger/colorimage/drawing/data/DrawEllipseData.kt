package com.client_leger.colorimage.drawing.data

data class DrawEllipseData(
    val drawPreview: Boolean,
    val strokeColor: String,
    val fillColor: String,
    val size: Int,
    val withStroke: Boolean,
    val withFill: Boolean,
    val isEven: Boolean,
    val beginning: Vec2,
    val end: Vec2,
    val text: String?,
    val textColor: String?
) : CommandData()
