package com.client_leger.colorimage.drawing.services

import android.graphics.*
import android.view.View
import android.widget.CheckBox
import android.widget.ImageView
import androidx.core.graphics.transform
import com.client_leger.colorimage.drawing.converter.Converter

object SelectionService {

    private val paint: Paint = Paint().apply {
        color = Color.BLUE
        strokeWidth = 5f
        style = Paint.Style.STROKE
    }

    private var pathSelection : Path = Path()
    private var rectF : RectF = RectF()

    private var startX : Float = 0f
    private var startY : Float = 0f
    private var scaleStartX : Float = 0f
    private var scaleStartY : Float = 0f

    var indexSelected : Int = -1
    var isSelected : Boolean = false
    var isShape : Boolean = false
    var clickToMove : Boolean = false
    var hasMove : Boolean = false

    var converter : Converter? = null

    fun onActionDown(x: Float, y: Float, bitmap: Bitmap) {
        if (x > bitmap.width || y > bitmap.height) { return }
        startX = x
        startY = y

        if(isSelected && inSelectionBound(startX, startY)){
            clickToMove = true
        }
        else {
            clickToMove = false
            val pixel: Int = bitmap.getPixel(x.toInt(), y.toInt())
            val foundIndexSelection: Int = HistoryService.findShapeByColor(pixel)

            if (foundIndexSelection == -1 && isSelected && indexSelected != -1) {
                converter?.unselectCommand(HistoryService.commandID[indexSelected])
                indexSelected = -1
            }
            else if(foundIndexSelection != -1) {
                indexSelected = foundIndexSelection
                if(HistoryService.commandSelected[indexSelected] == null){
                    converter?.selectCommand(HistoryService.commandID[indexSelected])
                }
            }
        }
    }

    fun selectShapeBounds(){
        if (indexSelected != -1){
            isSelected = true
            isShape = HistoryService.typeLists[indexSelected] == HistoryService.Type.STROKE
            pathSelection.reset()
            val pathShape: Path = HistoryService.mainPathLists[indexSelected]
            val paintShapeStroke : Float = HistoryService.mainPaintLists[indexSelected].strokeWidth / 2

            rectF = RectF()
            pathShape.computeBounds(rectF, true)
            rectF.bottom += paintShapeStroke
            rectF.top -= paintShapeStroke
            rectF.right += paintShapeStroke
            rectF.left -= paintShapeStroke

            pathSelection.addRect(rectF, Path.Direction.CCW)

            HistoryService.previewListPath.add(pathSelection)
            HistoryService.previewPaintLists.add(paint)

            if (inSelectionBound(startX, startY)){
                clickToMove = true
            }
        }
    }

    fun unSelectShapeBounds(){
        if(isSelected){

            HistoryService.clearPreview()

            isSelected = false
            isShape = false
            clickToMove = false
            hasMove = false

            startX = 0f
            startY = 0f
        }
    }

    fun delete(){
        unSelectShapeBounds()
        HistoryService.delete(indexSelected)
    }

    fun changeWidth(width:Float){
        val tmp = isShape
        val tmpIsSelected = isSelected
        unSelectShapeBounds()
        isSelected = tmpIsSelected
        isShape = tmp
        HistoryService.mainPaintLists[indexSelected].strokeWidth = width
        selectShapeBounds()
    }

    fun changeColorStroke(color : Int){
        HistoryService.mainPaintLists[indexSelected].color = color
    }

    fun changeColorFill(color: Int){
        if(isShape) {
            HistoryService.mainFillPaint[indexSelected]!!.color = color
            if (color == Color.TRANSPARENT){
                HistoryService.colorIDFillList[indexSelected] = null
            }
            else{
                val paintFillID = PaintService.createPaintFill()
                paintFillID.color = HistoryService.colorIDList[indexSelected].color
                HistoryService.colorIDFillList[indexSelected] = paintFillID
            }
        }
    }

    fun changeColorText(color: Int){
        if (HistoryService.textColor[indexSelected] != null)
            HistoryService.textColor[indexSelected]!!.color = color
    }

    var translateMatrix = Matrix()
    fun onActionMove(x: Float, y: Float){
        var xx = x
        if (x < 0){
            xx = 0f
        }
        var yy = y
        if (y < 0){
            yy = 0f
        }

        if (clickToMove && indexSelected != -1){
            translateMatrix = Matrix()
            val dx = xx - startX
            val dy = yy - startY

            HistoryService.listPoints[indexSelected].forEach {
                it.x += dx
                it.y += dy
            }

            translateMatrix.setTranslate(dx, dy)
            HistoryService.previewListPath[0].transform(translateMatrix)
            HistoryService.mainPathLists[indexSelected].transform(translateMatrix)

            startX = xx
            startY = yy
            hasMove = true
        }
    }

    fun onActionUp(x:Float, y: Float){
        if (clickToMove && hasMove){
            val tmpIsSelected = isSelected
            val tmpIsShape = isShape
            unSelectShapeBounds()
            isSelected = tmpIsSelected
            isShape = tmpIsShape
            selectShapeBounds()
            hasMove = false
            clickToMove = false
            translateMatrix.setTranslate(0f,0f)
        }
    }

    private const val canvasX : Int = 320
    private const val canvasY : Int = 80
    fun setAnchors(button_up_right : ImageView, button_up_left : ImageView,
                   button_down_right : ImageView, button_down_left : ImageView, density : Float){

        val offsetX = canvasX * density
        val offsetY = canvasY * density

        rectF.transform(translateMatrix)
        button_up_right.translationX = rectF.right - 10 + offsetX
        button_up_right.translationY = rectF.top - 10 + offsetY


        button_up_left.translationX = rectF.left - 10 + offsetX
        button_up_left.translationY = rectF.top - 10 + offsetY


        button_down_right.x = rectF.right - 10 + offsetX
        button_down_right.y = rectF.bottom - 10 + offsetY

        button_down_left.x = rectF.left - 10 + offsetX
        button_down_left.y = rectF.bottom - 10 + offsetY

        button_up_right.visibility = View.VISIBLE
        button_up_left.visibility = View.VISIBLE
        button_down_right.visibility = View.VISIBLE
        button_down_left.visibility = View.VISIBLE
    }

    fun hideAnchors(button_up_right : ImageView, button_up_left : ImageView,
                    button_down_right : ImageView, button_down_left : ImageView){
        button_up_right.visibility = View.GONE
        button_up_left.visibility = View.GONE
        button_down_right.visibility = View.GONE
        button_down_left.visibility = View.GONE
    }

    fun checkTransparency(checkBox: CheckBox){
        if (isShape){
            checkBox.isChecked = HistoryService.colorIDFillList[indexSelected] == null
        }
    }

    private fun inSelectionBound(x: Float, y: Float) : Boolean{
        return ((x >= rectF.left) && (y >= rectF.top) && (x < rectF.right) && (y < rectF.bottom))
    }

    fun onScaleActionDown(x : Float, y : Float){
        scaleStartX = x
        scaleStartY = y
    }

    fun onScaleActionMove(x : Float, y : Float, button: String, rawX:Float, rawY:Float, density: Float){
        if(indexSelected == -1) return
        var xCorner = 0f
        var yCorner = 0f

        val rectF = RectF()
        HistoryService.mainPathLists[indexSelected].computeBounds(rectF, true)

        val stroke : Float = HistoryService.mainPaintLists[indexSelected].strokeWidth
        val dx = (x - scaleStartX)
        val dy = (y - scaleStartY)
        val originalWidth = rectF.right - rectF.left
        val originalHeight = rectF.bottom - rectF.top

        var sx = 0f
        var sy = 0f
        var ty = 0f
        var tx = 0f
        when (button) {
            "buttonUpRight" -> {
                xCorner = rectF.left
                yCorner = rectF.bottom
                sx = (originalWidth + dx) / originalWidth
                sy = (originalHeight - dy) / originalHeight
                tx = HistoryService.listPoints[indexSelected].minOf { it.x }
                ty = HistoryService.listPoints[indexSelected].maxOf { it.y }
            }
            "buttonUpLeft" -> {
                xCorner = rectF.right
                yCorner = rectF.bottom
                sx = (originalWidth - dx) / originalWidth
                sy = (originalHeight - dy) / originalHeight
                tx = HistoryService.listPoints[indexSelected].maxOf { it.x }
                ty = HistoryService.listPoints[indexSelected].maxOf { it.y }
            }
            "buttonDownRight" -> {
                xCorner = rectF.left
                yCorner = rectF.top
                sx = (originalWidth + dx) / originalWidth
                sy = (originalHeight + dy) / originalHeight
                tx = HistoryService.listPoints[indexSelected].minOf { it.x }
                ty = HistoryService.listPoints[indexSelected].minOf { it.y }
            }
            "buttonDownLeft" -> {
                xCorner = rectF.right
                yCorner = rectF.top
                sx = (originalWidth - dx) / originalWidth
                sy = (originalHeight + dy) / originalHeight
                tx = HistoryService.listPoints[indexSelected].maxOf { it.x }
                ty = HistoryService.listPoints[indexSelected].minOf { it.y }
            }
        }

        if (originalWidth * sx <= stroke*2){
            sx = 1f
        }

        if (originalHeight * sy <= stroke*2){
            sy = 1f
        }

        val scaleMatrix = Matrix()
        scaleMatrix.setScale(sx, sy, xCorner, yCorner)
        HistoryService.mainPathLists[indexSelected].transform(scaleMatrix)

        if (HistoryService.typeLists[indexSelected] == HistoryService.Type.STROKE){
            HistoryService.previewListPath[0].transform(scaleMatrix)
            HistoryService.listPoints[indexSelected][0].x = rectF.left
            HistoryService.listPoints[indexSelected][0].y = rectF.top
            HistoryService.listPoints[indexSelected][1].x = rectF.right
            HistoryService.listPoints[indexSelected][1].y = rectF.bottom
        }
        else {
            var xx = 0f
            var yy = 0f
            when (button) {
                "buttonUpRight" -> {
                    xx = rectF.left
                    yy = rectF.bottom
                }
                "buttonUpLeft" -> {
                    xx = rectF.right
                    yy = rectF.bottom
                }
                "buttonDownRight" -> {
                    xx = rectF.left
                    yy = rectF.top
                }
                "buttonDownLeft" -> {
                    xx = rectF.right
                    yy = rectF.top
                }
            }

            if (HistoryService.listPoints[indexSelected].size > 1){
                HistoryService.listPoints[indexSelected].forEach {
                    it.x = (it.x - tx) * sx + xx
                    it.y = (it.y - ty) * sy + yy
                    HistoryService.previewListPath[0].transform(scaleMatrix)
                }
            }
        }
    }

    fun clear(){
        pathSelection = Path()
        rectF = RectF()

        indexSelected = -1

        startX = 0f
        startY = 0f
        scaleStartX = 0f
        scaleStartY = 0f

        isSelected = false
        isShape = false
        clickToMove = false
    }
}
