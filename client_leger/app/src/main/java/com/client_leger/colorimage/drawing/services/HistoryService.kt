package com.client_leger.colorimage.drawing.services

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import com.client_leger.colorimage.drawing.canvas_view.CanvasView
import com.client_leger.colorimage.drawing.data.LayersData
import com.client_leger.colorimage.drawing.data.Vec2
import kotlin.random.Random

object HistoryService {

    enum class Type{
        FILL,
        STROKE,
        PEN
    }

    val listLayer : MutableList<LayersData> = ArrayList()

    // Dessin en entier
    val mainPathLists: MutableList<Path> = ArrayList()
    val mainPaintLists: MutableList<Paint> = ArrayList()

    val mainFillPath: MutableList<Path?> = ArrayList()
    val mainFillPaint: MutableList<Paint?> = ArrayList()

    val textInShape: MutableList<String?> = ArrayList()
    val textColor : MutableList<Paint?> = ArrayList()

    val colorIDList: MutableList<Paint> = ArrayList()
    val colorIDFillList: MutableList<Paint?> = ArrayList()

    val typeLists: MutableList<Type> = ArrayList()

    val commandID : MutableList<String> = ArrayList()
    val commandSelected : MutableList<String?> = ArrayList()

    val listPoints : MutableList<ArrayList<Vec2>> = ArrayList()

    // Preview
    val previewListPath : MutableList<Path> = ArrayList()
    val previewPaintLists: MutableList<Paint> = ArrayList()
    val previewTypeLists: MutableList<Type> = ArrayList()

    /**
     * This method gets the instance of Path that pointer indicates.
     *
     * @return the instance of Path
     */
    val currentPreview: Path
        get() = previewListPath[previewListPath.size - 1]

    fun clearPreview(){
        previewListPath.clear()
        previewPaintLists.clear()
        previewTypeLists.clear()
    }

    fun addPenPreview(path: Path, mode : CanvasView.Mode){
        previewListPath.add(path)
        previewPaintLists.add(PaintService.createPaint(mode))
        previewTypeLists.add(Type.PEN)
    }

    fun addShapePreview(pathStroke: Path, pathFill: Path, mode : CanvasView.Mode){
        previewListPath.add(pathFill)
        previewListPath.add(pathStroke)
        previewPaintLists.add(PaintService.createPaintFill())
        previewPaintLists.add(PaintService.createPaint(mode))
        previewTypeLists.add(Type.PEN)
        previewTypeLists.add(Type.FILL)
        previewTypeLists.add(Type.STROKE)
    }

    fun updateMainHistory(path: Path, paint: Paint) {
        val colorID = randomColorGenerator()
        mainPathLists.add(path)
        mainPaintLists.add(paint)

        mainFillPath.add(null)
        mainFillPaint.add(null)

        textInShape.add(null)
        textColor.add(null)

        //Selection ID
        val paintStrokeID = PaintService.createPaint(CanvasView.Mode.DRAW)
        paintStrokeID.color = colorID
        paintStrokeID.strokeWidth = paint.strokeWidth
        colorIDList.add(paintStrokeID)
        colorIDFillList.add(null)

        typeLists.add(Type.PEN)

        listLayer.add(0,
            LayersData(
                "Crayon",
                paint.color,
                Color.TRANSPARENT,
                paint.strokeWidth.toInt().toString(),
                null
            )
        )

        commandSelected.add(null)
    }

    fun updateMainHistoryShape(pathStroke: Path, pathFill: Path, paintStroke : Paint, paintFill : Paint, type : String){

        val colorID = randomColorGenerator()

        mainFillPath.add(pathFill)
        mainPathLists.add(pathStroke)

        mainFillPaint.add(paintFill)
        mainPaintLists.add(paintStroke)

        textInShape.add(null)
        textColor.add(PaintService.createPaint(CanvasView.Mode.TEXT))

        // ID for selection
        if (paintFill.color == Color.TRANSPARENT){
            colorIDFillList.add(null)
        }
        else{
            val paintFillID = PaintService.createPaintFill()
            paintFillID.color = colorID
            colorIDFillList.add(paintFillID)
        }
        val paintStrokeID = PaintService.createPaint(CanvasView.Mode.DRAW)
        paintStrokeID.color = colorID
        colorIDList.add(paintStrokeID)

        typeLists.add(Type.STROKE)

        listLayer.add(0,
            LayersData(
                type,
                paintStroke.color,
                paintFill.color,
                paintStroke.strokeWidth.toInt().toString(),
                null
            )
        )

        commandSelected.add(null)
    }

    fun findShapeByColor(color : Int):Int {
        for ((index, paint) in colorIDList.withIndex().reversed()) {
            if(paint.color == color || (colorIDFillList[index] == null && colorIDFillList[index]?.color == color)){
                return index
            }
        }
        return -1
    }

    fun delete(index : Int){
        mainPathLists.removeAt(index)
        mainPaintLists.removeAt(index)

        mainFillPath.removeAt(index)
        mainFillPaint.removeAt(index)

        typeLists.removeAt(index)
        colorIDFillList.removeAt(index)

        colorIDList.removeAt(index)
        commandID.removeAt(index)
        commandSelected.removeAt(index)
        listPoints.removeAt(index)

        textInShape.removeAt(index)
        textColor.removeAt(index)

        listLayer.removeAt(listLayer.size - 1 - index)
    }

    private fun randomColorGenerator(): Int {
        return Color.argb(255, Random.nextInt(0,256), Random.nextInt(0,256), Random.nextInt(0,256))
    }

    fun clear(){
        mainPathLists.clear()
        mainPaintLists.clear()
        mainFillPath.clear()
        mainFillPaint.clear()
        colorIDList.clear()
        colorIDFillList.clear()
        typeLists.clear()
        listLayer.clear()
        commandID.clear()
        listPoints.clear()
        commandSelected.clear()
        textInShape.clear()
        textColor.clear()
        clearPreview()
    }

    fun swap(initialPosition: Int, toPosition:Int){

        mainPathLists.add(toPosition,mainPathLists.removeAt(initialPosition))

        mainPaintLists.add(toPosition, mainPaintLists.removeAt(initialPosition))

        mainFillPath.add(toPosition, mainFillPath.removeAt(initialPosition))

        mainFillPaint.add(toPosition, mainFillPaint.removeAt(initialPosition))

        colorIDList.add(toPosition, colorIDList.removeAt(initialPosition))

        colorIDFillList.add(toPosition, colorIDFillList.removeAt(initialPosition))

        typeLists.add(toPosition, typeLists.removeAt(initialPosition))

        commandID.add(toPosition, commandID.removeAt(initialPosition))

        listPoints.add(toPosition, listPoints.removeAt(initialPosition))

        commandSelected.add(toPosition, commandSelected.removeAt(initialPosition))

        textInShape.add(toPosition, textInShape.removeAt(initialPosition))
        textColor.add(toPosition, textColor.removeAt(initialPosition))

        val indexLayer = mainPathLists.size - 1 - initialPosition
        val moveTo = listLayer.size - 1 - toPosition

        listLayer.add(moveTo, listLayer.removeAt(indexLayer))
    }

    fun updateSelection(index: Int, path : Path, paint : Paint, pathFill: Path? = null, paintFill: Paint? = null){
        mainPathLists[index] = path
        mainPaintLists[index] = paint

        listLayer[listLayer.size - 1 - index].width = paint.strokeWidth.toInt().toString()
        listLayer[listLayer.size - 1 - index].strokeColor = paint.color

        colorIDList[index].strokeWidth = paint.strokeWidth

        if (pathFill != null){
            mainFillPath[index] = pathFill
            mainFillPaint[index] = paintFill
            listLayer[listLayer.size - 1 - index].fillColor = paintFill!!.color
        }
    }
}
