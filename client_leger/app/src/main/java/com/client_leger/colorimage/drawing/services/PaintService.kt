package com.client_leger.colorimage.drawing.services

import android.graphics.*
import com.client_leger.colorimage.drawing.canvas_view.CanvasView

object PaintService {

    // for Paint
    var paintStyle = Paint.Style.STROKE

    var paintStrokeColor = Color.BLACK
    var paintFillColor = Color.WHITE
    var textColor = Color.BLACK

    var paintStrokeWidth = 3f
    var opacity = 255

    var lineCap = Paint.Cap.ROUND

    // Text
    var fontSize = 20f
    val textAlign = Paint.Align.CENTER // fixed

    fun createPaint(mode : CanvasView.Mode): Paint {
        val paint = Paint()
        paint.isAntiAlias = true
        paint.style = paintStyle
        paint.strokeWidth = paintStrokeWidth
        paint.strokeCap = lineCap
        paint.strokeJoin = Paint.Join.MITER // fixed

        // for Text
        if (mode == CanvasView.Mode.TEXT) {
            paint.typeface = Typeface.create("Arial", Typeface.NORMAL)
            paint.textSize = fontSize
            paint.textAlign = textAlign
            paint.strokeWidth = 0f
            paint.color = textColor
            paint.style = Paint.Style.FILL
        }
        else {
            // Otherwise
            paint.color = paintStrokeColor
            paint.alpha = opacity
        }
        return paint
    }

    fun createPaintFill(): Paint{
        val paint = Paint()
        paint.isAntiAlias = true
        paint.style = Paint.Style.FILL
        paint.color = paintFillColor
        return paint
    }

    fun setDefault(){
        paintStyle = Paint.Style.STROKE
        paintStrokeWidth = 3f
        paintStrokeColor = Color.BLACK
        paintFillColor = Color.WHITE
    }
}
