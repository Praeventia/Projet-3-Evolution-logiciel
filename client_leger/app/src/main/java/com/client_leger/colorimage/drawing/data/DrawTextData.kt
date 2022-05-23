package com.client_leger.colorimage.drawing.data

data class DrawTextData(
    val color: String,
    val bold: Boolean,
    val italic: Boolean,
    val size: Int,
    val police: String,
    val textAlign: String,
    val text: List<String>,
    val startPos: Int,
    val beginning: Vec2,
) : CommandData()
