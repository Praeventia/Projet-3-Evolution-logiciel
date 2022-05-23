package com.client_leger.colorimage.drawing.converter

import android.graphics.Color
import android.graphics.Path
import android.graphics.RectF
import android.util.Log
import androidx.core.graphics.ColorUtils
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.R
import com.client_leger.colorimage.drawing.canvas_view.CanvasView
import com.client_leger.colorimage.drawing.data.*
import com.client_leger.colorimage.drawing.services.HistoryService
import com.client_leger.colorimage.drawing.services.PaintService
import com.client_leger.colorimage.drawing.services.SelectionService
import com.google.android.material.snackbar.Snackbar
import com.google.gson.Gson
import io.socket.client.Ack
import io.socket.client.Socket
import org.json.JSONObject

class Converter(drawingID:String, password : String?) {

    enum class CommandType {
        Pencil,
        Rectangle,
        Ellipse,
    }

    var listPoints :  ArrayList<Vec2> = arrayListOf()
    lateinit var startPoint : Vec2
    lateinit var endPoint : Vec2
    lateinit var canvasView: CanvasView

    private var socketDrawing: Socket

    init {
        DrawingSocketHandler.setSocket(drawingID, password)
        socketDrawing = DrawingSocketHandler.getSocket()

        socketDrawing.on("drawingFromServer"){args ->
            val data = args[0] as JSONObject
            val commandID = data.get("_id") as String
            val commandFromServer = Gson().fromJson(data.get("command").toString(), CommandToServer::class.java)
            transformCommandFromServer(commandFromServer, commandID)
            if (canvasView.getIndexLayer() != -1)
                canvasView.incrementIndexLayer()
            canvasView.invalidateView()
            canvasView.updateLayers()
        }

        socketDrawing.on("selectCommandFromServer"){ args ->
            val data = args[0] as JSONObject
            val commandID = data.get("commandID").toString()
            val userID = data.get("userID").toString()
            val index = HistoryService.commandID.indexOf(commandID)
            val layerIndex = HistoryService.listLayer.size - 1 - index
            canvasView.findName(userID, HistoryService.listLayer[layerIndex], layerIndex)
            if (userID in HistoryService.commandSelected){
                val oldIndex = HistoryService.commandSelected.indexOf(userID)
                HistoryService.commandSelected[oldIndex] = null
                HistoryService.listLayer[HistoryService.listLayer.size - 1 - oldIndex].userId = null
            }
            HistoryService.commandSelected[index] = userID
            canvasView.invalidateView()
        }

        socketDrawing.on("changeCommandFromServer"){ args ->
            val dataResponse = args[0] as JSONObject
            val commandIDResponse = dataResponse.get("commandID").toString()
            val commandToClient = JSONObject(dataResponse.get("commandToClient").toString())
            val command = Gson().fromJson(commandToClient.get("command").toString(), CommandToServer::class.java)
            val index = transformCommandFromServer(command, commandIDResponse)
            canvasView.invalidateView()
            canvasView.updateSpecifyLayer(HistoryService.listLayer.size - 1 - index)
        }

        socketDrawing.on("switchCommandFromServer"){ args ->
            val dataResponse = args[0] as JSONObject
            val currentPosition = dataResponse.get("commandPosition").toString().toInt()
            val destination  = dataResponse.get("newPosition").toString().toInt()

            if(SelectionService.isSelected && (currentPosition < SelectionService.indexSelected && destination >= SelectionService.indexSelected)){
                SelectionService.indexSelected--
                canvasView.incrementIndexLayer()
            }
            else if (SelectionService.isSelected && (currentPosition > SelectionService.indexSelected && destination <= SelectionService.indexSelected)){
                SelectionService.indexSelected++
                canvasView.decrementIndexLayer()
            }

            HistoryService.swap(currentPosition, destination)
            canvasView.invalidateView()
            canvasView.updateLayers()
        }

        socketDrawing.on("unselectCommandFromServer"){ args ->
            val data = args[0] as JSONObject
            val commandID = data.get("commandID").toString()
            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.commandSelected[index] = null
            val layerIndex = HistoryService.listLayer.size - 1 - index
            HistoryService.listLayer[layerIndex].userId = null
            canvasView.updateSpecifyLayer(layerIndex)
            canvasView.invalidateView()
        }

        socketDrawing.on("deleteCommandFromServer"){args ->
            val dataResponse = args[0] as JSONObject
            val id = dataResponse.get("commandID").toString()
            val index = HistoryService.commandID.indexOf(id)
            HistoryService.delete(index)
            if (SelectionService.isSelected && index < SelectionService.indexSelected){
                SelectionService.indexSelected--
            }
            else if (SelectionService.isSelected && index > SelectionService.indexSelected){
                canvasView.decrementIndexLayer()
            }
            canvasView.removeIndexLayer(HistoryService.listLayer.size - index)
            canvasView.invalidateView()
            canvasView.updateLayers()
        }

        socketDrawing.on("exception") { args ->
            val dataResponse = args[0] as JSONObject
            val snackbar = Snackbar.make(
                canvasView,
                dataResponse.getString("message"),
                3000
            )
            snackbar.setTextColor(Color.RED)
            snackbar.show()
        }
    }

    private fun sendData(commandData: CommandData, toolType:Constants.ToolType){
        val data = CommandToServer(toolType.ordinal, commandData)
        val jsonObject = JSONObject(Gson().toJson(data))
        socketDrawing.emit("drawingToServer", jsonObject, Ack{ response ->
            val dataResponse = response[0] as JSONObject
            val commandID = dataResponse.get("_id") as String
            val commandFromServer = Gson().fromJson(dataResponse.get("command").toString(), CommandToServer::class.java)
            transformCommandFromServer(commandFromServer, commandID)
            HistoryService.clearPreview()

            SelectionService.indexSelected = HistoryService.commandID.indexOf(commandID)
            selectCommand(commandID)
            canvasView.drawer = CanvasView.Drawer.NONE
            canvasView.mode = CanvasView.Mode.SELECTION
            canvasView.invalidateView()
            canvasView.updateLayers()
        })
    }

    fun selectCommand(commandID: String){
        val data = SelectCommandFromClient(commandID)
        val jsonObject = JSONObject(Gson().toJson(data))
        socketDrawing.emit("selectCommandToServer", jsonObject, Ack { response ->
            val dataResponse = response[0] as JSONObject
            if (dataResponse.get("commandID") as String == commandID){
                val index = HistoryService.commandID.indexOf(commandID)
                val layerIndex = HistoryService.listLayer.size - 1 - index
                canvasView.findName(User.getId(), HistoryService.listLayer[layerIndex], layerIndex)
                if (User.getId() in HistoryService.commandSelected){
                    val oldIndex = HistoryService.commandSelected.indexOf(User.getId())
                    HistoryService.commandSelected[oldIndex] = null
                    HistoryService.listLayer[HistoryService.listLayer.size - 1 - oldIndex].userId = null
                }
                HistoryService.commandSelected[index] = User.getId()
                SelectionService.indexSelected = index
                SelectionService.selectShapeBounds()
                SelectionService.hasMove = false
                canvasView.setUpSelection()
                canvasView.invalidateView()
            }
        })
    }

    fun unselectCommand(commandID: String){
        val data = UnselectCommandFromClient(commandID)
        val jsonObject = JSONObject(Gson().toJson(data))
        socketDrawing.emit("unselectCommandToServer", jsonObject, Ack {
            canvasView.unselect()
            canvasView.updateUI()
            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.commandSelected[index] = null
            HistoryService.listLayer[HistoryService.listLayer.size - 1 - index].userId = null
            canvasView.updateLayers()
        })
    }

    fun changeCommand(index : Int){
        val commandID = HistoryService.commandID[index]
        var commandData = CommandData()
        val hslStroke = FloatArray(3)
        val hslFill = FloatArray(3)
        val hslTextColor = FloatArray(3)

        var isTransparent = false

        var textColor = String()
        var text = String()
        if (HistoryService.typeLists[index] == HistoryService.Type.STROKE ) {
            isTransparent = HistoryService.mainFillPaint[index]!!.color == Color.TRANSPARENT

            if (HistoryService.textInShape[index] != null){
                text = HistoryService.textInShape[index]!!
                ColorUtils.colorToHSL(HistoryService.textColor[index]!!.color, hslTextColor)
                textColor = transformToColorString(hslTextColor, false)
            }
        }
        var type : Constants.ToolType = Constants.ToolType.Pencil
        when(HistoryService.listLayer[HistoryService.listLayer.size - 1 - index].shapeType){
            "Rectangle" ->{
                type = Constants.ToolType.Rectangle
                ColorUtils.colorToHSL(HistoryService.mainPaintLists[index].color, hslStroke)
                ColorUtils.colorToHSL(HistoryService.mainFillPaint[index]!!.color, hslFill)
                commandData = DrawRectangleData(transformToColorString(hslStroke, false),
                    transformToColorString(hslFill, isTransparent),
                    PaintService.paintStrokeWidth.toInt(),
                    withStroke = true,
                    withFill = true,
                    beginning = HistoryService.listPoints[index][0],
                    end = HistoryService.listPoints[index][1],
                    isEven = false,
                    text = text,
                    textColor = textColor
                )
            }
            "Ellipse" -> {
                type = Constants.ToolType.Ellipse
                ColorUtils.colorToHSL(HistoryService.mainPaintLists[index].color, hslStroke)
                ColorUtils.colorToHSL(HistoryService.mainFillPaint[index]!!.color, hslFill)
                commandData = DrawEllipseData(false, transformToColorString(hslStroke, false),
                    transformToColorString(hslFill, isTransparent),
                    PaintService.paintStrokeWidth.toInt(),
                    withStroke = true,
                    withFill = true,
                    isEven = false,
                    beginning = HistoryService.listPoints[index][0],
                    end = HistoryService.listPoints[index][1],
                    text = text,
                    textColor = textColor
                )
            }
            "Crayon" -> {
                type = Constants.ToolType.Pencil
                ColorUtils.colorToHSL(HistoryService.mainPaintLists[index].color, hslStroke)
                commandData = DrawPencilData(HistoryService.listPoints[index],
                    transformToColorString(hslStroke, false),
                    PaintService.paintStrokeWidth.toInt()
                )
            }
        }
        val data = ChangeCommandFromClient(commandID, CommandToServer(type.ordinal, commandData))
        val jsonObject = JSONObject(Gson().toJson(data))
        socketDrawing.emit("changeCommandToServer", jsonObject, Ack { response ->
            val dataResponse = response[0] as JSONObject
            val commandIDResponse = dataResponse.get("commandID").toString()
            val commandToClient = JSONObject(dataResponse.get("commandToClient").toString())
            val command = Gson().fromJson(commandToClient.get("command").toString(), CommandToServer::class.java)
            transformCommandFromServer(command, commandIDResponse)
            SelectionService.unSelectShapeBounds()
            SelectionService.selectShapeBounds()
            canvasView.setAnchors()
            canvasView.invalidateView()
            canvasView.updateSpecifyLayer()
        })
    }

    fun switchCommand(currentIndex:Int , toIndex: Int){
        val data = SwitchCommandFromClient(currentIndex, toIndex)
        val jsonObject = JSONObject(Gson().toJson(data))
        socketDrawing.emit("switchCommandToServer", jsonObject, Ack { args ->
            val dataResponse = args[0] as JSONObject
            val currentPosition = dataResponse.get("commandPosition").toString().toInt()
            val destination  = dataResponse.get("newPosition").toString().toInt()
            SelectionService.unSelectShapeBounds()
            SelectionService.indexSelected = destination
            HistoryService.swap(currentPosition, destination)
            SelectionService.selectShapeBounds()
            canvasView.updateIndexLayer(HistoryService.listLayer.size - 1 - destination)
            canvasView.invalidateView()
            canvasView.updateLayers()
        })
    }

    fun deleteCommand(commandID : String){
        val data = DeleteCommandFromClient(commandID)
        val jsonObject = JSONObject(Gson().toJson(data))
        socketDrawing.emit("deleteCommandToServer", jsonObject, Ack {args ->
            val dataResponse = args[0] as JSONObject
            val id = dataResponse.get("commandID").toString()
            val index = HistoryService.commandID.indexOf(id)
            canvasView.removeIndexLayer(HistoryService.listLayer.size - 1 -index)
            canvasView.updateIndexLayer(-1)
            SelectionService.delete()
            canvasView.hideAnchors()
            canvasView.invalidateView()
            canvasView.updateLayers()
        })
    }

    private fun transformCommandFromServer(commandFromServer: CommandToServer, commandID:String) : Int{
        when(commandFromServer.tool){
            Constants.ToolType.Pencil.ordinal ->{
                return transformToPen(Gson().fromJson(Gson().toJson(commandFromServer.commandData).toString(), DrawPencilData::class.java), commandID)
            }
            Constants.ToolType.Rectangle.ordinal ->{
                return transformToRectangle(Gson().fromJson(Gson().toJson(commandFromServer.commandData).toString(), DrawRectangleData::class.java), commandID)
            }
            Constants.ToolType.Ellipse.ordinal ->{
                return transformToEllipse(Gson().fromJson(Gson().toJson(commandFromServer.commandData).toString(), DrawEllipseData::class.java), commandID)
            }
        }
        return - 1
    }

    private fun transformToPen(drawPencilData: DrawPencilData, commandID: String) : Int{
        val path = Path()
        val list = arrayListOf<Vec2>()
        path.moveTo(drawPencilData.pathData[0].x, drawPencilData.pathData[0].y)
        list.add(drawPencilData.pathData[0])

        if(drawPencilData.pathData.size <= 1){
            path.lineTo(drawPencilData.pathData[0].x, drawPencilData.pathData[0].y)
        }
        else{
            for (i in 1 until drawPencilData.pathData.size){
                path.lineTo(drawPencilData.pathData[i].x, drawPencilData.pathData[i].y)
                list.add(drawPencilData.pathData[i])
            }
        }

        val paint = PaintService.createPaint(CanvasView.Mode.DRAW)
        paint.strokeWidth = drawPencilData.size.toFloat()
        paint.color = extractColor(drawPencilData.color)

        if(commandID in HistoryService.commandID){
            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.updateSelection(index, path, paint)
            return index
        }
        else{
            HistoryService.updateMainHistory(path, paint)
            HistoryService.commandID.add(commandID)
            HistoryService.listPoints.add(list)
        }
        return -1
    }

    private fun transformToRectangle(drawRectangleData: DrawRectangleData, commandID: String) : Int{
        val strokeColor = extractColor(drawRectangleData.strokeColor)
        val fillColor = extractColor(drawRectangleData.fillColor)

        var textColor : Int = -1
        if (!drawRectangleData.textColor.isNullOrEmpty()) {textColor = extractColor(drawRectangleData.textColor)}
        val text : String? = null

        val paintFill = PaintService.createPaintFill()
        val paintStroke = PaintService.createPaint(CanvasView.Mode.DRAW)
        val path = Path()
        path.moveTo(drawRectangleData.beginning.x, drawRectangleData.beginning.y)

        if (drawRectangleData.withFill && drawRectangleData.withStroke){
            paintFill.color = fillColor

            paintStroke.color = strokeColor
            paintStroke.strokeWidth = drawRectangleData.size.toFloat()
        }
        else if (drawRectangleData.withFill){
            paintFill.color = fillColor

            paintStroke.color = fillColor
            paintStroke.strokeWidth = drawRectangleData.size.toFloat()
        }
        else{
            paintFill.color = Color.TRANSPARENT

            paintStroke.color = strokeColor
            paintStroke.strokeWidth = drawRectangleData.size.toFloat()
        }

        val rect = RectF(drawRectangleData.beginning.x, drawRectangleData.beginning.y, drawRectangleData.end.x, drawRectangleData.end.y)
        path.addRect(rect, Path.Direction.CCW)

        if(commandID in HistoryService.commandID){
            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.updateSelection(index, path, paintStroke, path, paintFill)
            HistoryService.textInShape[index] = text
            if (!drawRectangleData.text.isNullOrEmpty()){
                HistoryService.textInShape[index] = drawRectangleData.text
                HistoryService.textColor[index]!!.color = textColor
            }
            return index
        }
        else{
            HistoryService.updateMainHistoryShape(path, path, paintStroke, paintFill, "Rectangle")

            HistoryService.commandID.add(commandID)
            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.textInShape[index] = text
            if (!drawRectangleData.text.isNullOrEmpty()){
                HistoryService.textInShape[index] = drawRectangleData.text
                HistoryService.textColor[index]!!.color = textColor
            }

            HistoryService.listPoints.add(arrayListOf(drawRectangleData.beginning, drawRectangleData.end))
        }
        return -1
    }

    private fun transformToEllipse(drawEllipseData: DrawEllipseData, commandID: String) :Int {
        val strokeColor = extractColor(drawEllipseData.strokeColor)
        val fillColor = extractColor(drawEllipseData.fillColor)

        var textColor : Int = -1
        if (!drawEllipseData.textColor.isNullOrEmpty()) {textColor = extractColor(drawEllipseData.textColor)}
        val text : String? = null

        val paintFill = PaintService.createPaintFill()
        val paintStroke = PaintService.createPaint(CanvasView.Mode.DRAW)
        val path = Path()
        path.moveTo(drawEllipseData.beginning.x, drawEllipseData.beginning.y)

        if (drawEllipseData.withFill && drawEllipseData.withStroke){
            paintFill.color = fillColor

            paintStroke.color = strokeColor
            paintStroke.strokeWidth = drawEllipseData.size.toFloat()
        }
        else if (drawEllipseData.withFill){
            paintFill.color = fillColor

            paintStroke.color = fillColor
            paintStroke.strokeWidth = drawEllipseData.size.toFloat()
        }
        else{
            paintFill.color = Color.TRANSPARENT

            paintStroke.color = strokeColor
            paintStroke.strokeWidth = drawEllipseData.size.toFloat()
        }

        val rect = RectF(drawEllipseData.beginning.x, drawEllipseData.beginning.y, drawEllipseData.end.x, drawEllipseData.end.y)
        path.addOval(rect, Path.Direction.CCW)

        if(commandID in HistoryService.commandID){
            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.updateSelection(index, path, paintStroke, path, paintFill)
            HistoryService.textInShape[index] = text
            if (!drawEllipseData.text.isNullOrEmpty()){
                HistoryService.textInShape[index] = drawEllipseData.text
                HistoryService.textColor[index]!!.color = textColor
            }
            return index
        }
        else {
            HistoryService.updateMainHistoryShape(path, path, paintStroke, paintFill, "Ellipse")
            HistoryService.commandID.add(commandID)

            val index = HistoryService.commandID.indexOf(commandID)
            HistoryService.textInShape[index] = text
            if (!drawEllipseData.text.isNullOrEmpty()){
                HistoryService.textInShape[index] = drawEllipseData.text
                HistoryService.textColor[index]!!.color = textColor
            }

            HistoryService.listPoints.add(
                arrayListOf(
                    drawEllipseData.beginning,
                    drawEllipseData.end
                )
            )
        }
        return -1
    }

    private fun transformToColorString(hsl : FloatArray, isTransparent: Boolean): String{
        return if(!isTransparent)
            "hsla(${hsl[0].toInt()},${(hsl[1]*100).toInt()}%,${(hsl[2]*100).toInt()}%,1)"
        else
            "hsla(${hsl[0].toInt()},${(hsl[1]*100).toInt()}%,${(hsl[2]*100).toInt()}%,0)"
    }

    private fun extractColor(colorString : String) : Int{
        var colorStringWithout = colorString.removeRange(IntRange(0,4))
        colorStringWithout = colorStringWithout.replace("%", "").replace(")","")
        val listHSLA = colorStringWithout.split(",")
        val list = floatArrayOf(listHSLA[0].toFloat(), listHSLA[1].toFloat()/100, listHSLA[2].toFloat()/100)
        val color = ColorUtils.HSLToColor(list)
        var alpha = 255
        if(listHSLA.size == 4)
            alpha  = if(listHSLA[3].toInt() == 1) 255 else 0
        return ColorUtils.setAlphaComponent(color, alpha)
    }

    fun transformListCommand(list: List<JSONObject>){
        list.forEach {
            val commandID = it.get("_id") as String
            val commandFromServer = Gson().fromJson(it.get("command").toString(), CommandToServer::class.java)
            transformCommandFromServer(commandFromServer, commandID)
        }
        canvasView.updateLayers()
    }

    fun transformCommandToServer(commandType : CommandType){
        val commandData : CommandData
        val hslStroke = FloatArray(3)
        val hslFill = FloatArray(3)
        val hslTextColor = FloatArray(3)

        var isTransparent = false

        if(PaintService.paintFillColor == Color.TRANSPARENT){
            isTransparent = true
        }

        when(commandType){
            CommandType.Pencil ->{
                ColorUtils.colorToHSL(PaintService.paintStrokeColor, hslStroke)
                commandData = DrawPencilData(listPoints, transformToColorString(hslStroke, false), PaintService.paintStrokeWidth.toInt())
                sendData(commandData, Constants.ToolType.Pencil)
            }
            CommandType.Ellipse ->{
                ColorUtils.colorToHSL(PaintService.paintStrokeColor, hslStroke)
                ColorUtils.colorToHSL(PaintService.paintFillColor, hslFill)
                ColorUtils.colorToHSL(PaintService.textColor, hslTextColor)
                commandData = DrawEllipseData(false, transformToColorString(hslStroke, false), transformToColorString(hslFill, isTransparent),
                    PaintService.paintStrokeWidth.toInt(),
                    withStroke = true,
                    withFill = true,
                    isEven = false,
                    beginning = startPoint,
                    end = endPoint,
                    text = String(),
                    textColor = String()
                )
                sendData(commandData, Constants.ToolType.Ellipse)
            }
            CommandType.Rectangle -> {
                ColorUtils.colorToHSL(PaintService.paintStrokeColor, hslStroke)
                ColorUtils.colorToHSL(PaintService.paintFillColor, hslFill)
                ColorUtils.colorToHSL(PaintService.textColor, hslTextColor)
                commandData = DrawRectangleData(transformToColorString(hslStroke, false), transformToColorString(hslFill, isTransparent),
                    PaintService.paintStrokeWidth.toInt(),
                    withStroke = true,
                    withFill = true,
                    beginning = startPoint,
                    end = endPoint,
                    isEven = false,
                    text = String(),
                    textColor = String()
                )
                sendData(commandData, Constants.ToolType.Rectangle)
            }
        }
    }

    fun connect(){
        DrawingSocketHandler.connect()
    }

    fun disconnect(){
        DrawingSocketHandler.disconnect()
    }
}
