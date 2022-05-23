/**
 * CanvasView.java
 *
 * Copyright (c) 2014 Tomohiro IKEDA (Korilakkuma)
 * Released under the MIT license
 */


package com.client_leger.colorimage.drawing.canvas_view

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.text.InputType
import android.text.SpannableStringBuilder
import android.util.AttributeSet
import android.util.Log
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.View.OnKeyListener
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import android.view.inputmethod.InputMethodManager
import android.widget.CheckBox
import android.widget.ImageView
import androidx.lifecycle.coroutineScope
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.drawing.CustomInputConnection
import com.client_leger.colorimage.drawing.DrawingActivity
import com.client_leger.colorimage.drawing.converter.Converter
import com.client_leger.colorimage.drawing.data.LayersData
import com.client_leger.colorimage.drawing.data.Vec2
import com.client_leger.colorimage.drawing.services.HistoryService
import com.client_leger.colorimage.drawing.services.PaintService
import com.client_leger.colorimage.drawing.services.SelectionService
import kotlinx.coroutines.launch
import org.json.JSONObject
import kotlin.math.abs


/**
 * This class defines fields and methods for drawing.
 */
class CanvasView : View {
    // Enumeration for Mode
    enum class Mode {
        DRAW,
        TEXT,
        SELECTION
    }

    // Enumeration for Drawer
    enum class Drawer {
        PEN,
        RECTANGLE,
        ELLIPSE,
        NONE
    }

    lateinit var converter: Converter
    private lateinit var contextView: DrawingActivity
    private var bitmap: Bitmap = Bitmap.createBitmap(1210, 800, Bitmap.Config.ARGB_8888)
    private var canvas: Canvas = Canvas(bitmap)

    // Selection ID
    private var bitmapCode: Bitmap = Bitmap.createBitmap(1210, 800, Bitmap.Config.ARGB_8888)
    private var canvasCode: Canvas = Canvas(bitmapCode)

    lateinit var buttonUpRight : ImageView
    lateinit var buttonUpLeft : ImageView
    lateinit var buttonDownRight : ImageView
    lateinit var buttonDownLeft : ImageView
    lateinit var checkBox: CheckBox

    private var baseColor = Color.WHITE
    private val selectedByOtherPaint = Paint()

    // Flags
    var mode = Mode.SELECTION
    var drawer = Drawer.NONE
    var oldDrawer = Drawer.NONE

    private var isDown : Boolean = false
    private var isSelectionDown : Boolean = false
    private var hasMoved : Boolean = false


    // for Text
    lateinit var text : SpannableStringBuilder
    var hasWrite : Boolean = false

    // for Drawer
    private var startX = 0f
    private var startY = 0f

    constructor(context: Context, attrs: AttributeSet?, defStyle: Int) :
            super(context, attrs, defStyle)
    {
        setup(context)
    }

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        setup(context)
    }

    constructor(context: Context) : super(context) {
        setup(context)
    }

    private fun setup(context: Context) {
        isFocusableInTouchMode = true
        text = SpannableStringBuilder()
        this.contextView = context as DrawingActivity

        setOnKeyListener(OnKeyListener { _, keyCode, event ->
            if (event.action == KeyEvent.ACTION_DOWN && SelectionService.isSelected &&
                contextView.toolFragment.showKeyboard)
                {
                    hasWrite = true
                if (event.unicodeChar == 0) { // control character
                    if (keyCode == KeyEvent.KEYCODE_DEL && text.isNotEmpty()) {
                        text.delete(text.length - 1, text.length)
                        HistoryService.textInShape[SelectionService.indexSelected] = text.toString()
                        this.invalidate()
                        return@OnKeyListener true
                    }
                }
                else if(event.unicodeChar == 10){
                    if (keyCode == KeyEvent.KEYCODE_ENTER){
                        closeInputText()
                        if (text.isEmpty()){
                            HistoryService.textInShape[SelectionService.indexSelected] = null
                            contextView.toolFragment.textOff()
                        }else{
                            converter.changeCommand(SelectionService.indexSelected)
                            hasWrite = false
                        }
                        text.clear()
                        this.invalidate()
                        return@OnKeyListener true
                    }
                }
                else { // text character
                    text.append(event.unicodeChar.toChar())
                    HistoryService.textInShape[SelectionService.indexSelected] = text.toString()
                    this.invalidate()
                    return@OnKeyListener true
                }
            }
            false
        })
    }

    private fun createPath(event: MotionEvent): Path {
        val path = Path()

        // Save for ACTION_MOVE
        startX = event.x
        startY = event.y
        path.moveTo(startX, startY)
        return path
    }

    val padding = 10
    private fun drawText(canvas: Canvas, path: Path,text:String, paint: Paint) {
        if (text.isEmpty()) {
            return
        }
        val textHeight = abs(paint.ascent() + paint.descent())

        val rectF = RectF()
        path.computeBounds(rectF, true)

        var y = rectF.top + textHeight * 2
        val textWidth = paint.measureText(text)

        val lineWidth = rectF.width() - padding
        val numberOfChars = text.count()

        if (textWidth + padding > lineWidth){
            val substring = StringBuilder("")
            for (i in 0 until numberOfChars){
                substring.append(text[i])
                val currentWidth = paint.measureText(substring.toString())
                if (currentWidth + padding >= lineWidth) {
                    canvas.drawText(substring.toString(), rectF.centerX(), y, paint)
                    y += textHeight
                    substring.clear()
                }
                else if (i == numberOfChars - 1){
                    canvas.drawText(substring.toString(), rectF.centerX(), y, paint)
                }
            }
        }
        else{
            canvas.drawText(text, rectF.centerX(), y, paint)
        }
    }

    private fun onActionDown(event: MotionEvent) {
        if(event.x > bitmap.width || event.y > bitmap.height) {
            isDown = false
            return
        }
        when (mode) {
            Mode.DRAW -> {
                converter.listPoints.clear()
                HistoryService.clearPreview()
                if(drawer == Drawer.RECTANGLE || drawer == Drawer.ELLIPSE) {
                    HistoryService.addShapePreview(createPath(event), createPath(event), mode)
                    hasMoved = false
                }
                else {
                    HistoryService.addPenPreview(createPath(event), mode)
                    converter.listPoints.add(Vec2(event.x, event.y))
                }
                isDown = true
            }
            Mode.SELECTION -> {
                isDown = true
                isSelectionDown = true
                closeInputText()
                if (hasWrite) {
                    converter.changeCommand(SelectionService.indexSelected)
                    hasWrite = false
                }
                else if(HistoryService.mainPathLists.size > 0){
                    SelectionService.onActionDown(event.x,event.y, bitmapCode)
                }
            }
            else ->{}
        }
    }

    private fun onActionMove(event: MotionEvent) {
        var x = event.x
        var y = event.y

        if(x < 0 ) { x  = 0f}
        if(y < 0 ) { y  = 0f}
        if (x > 1210) {x = 1210f}
        if (y > 800) {y = 800f}

        when (mode) {
            Mode.DRAW -> {
                if (!isDown || isSelectionDown) {
                    return
                }
                val path = HistoryService.currentPreview
                when (drawer) {
                    Drawer.PEN -> {
                        path.lineTo(x, y)
                        converter.listPoints.add(Vec2(x,y))
                    }
                    Drawer.RECTANGLE -> {
                        hasMoved = true
                        val pathFill = HistoryService.previewListPath[HistoryService.previewListPath.size - 2]
                        val rect : RectF
                        if (startX < x && startY < y){
                            rect = RectF(startX, startY, x, y)
                            converter.startPoint = Vec2(startX, startY)
                            converter.endPoint = Vec2(x, y)
                        }
                        else if (startX < x && startY > y) {
                            rect = RectF(startX, y, x, startY)
                            converter.startPoint = Vec2(startX, y)
                            converter.endPoint = Vec2(x, startY)
                        }
                        else if (startX > x && startY > y){
                            rect = RectF(x, y, startX, startY)
                            converter.startPoint = Vec2(x, y)
                            converter.endPoint = Vec2(startX, startY)
                        }
                        else{
                            rect = RectF(x, startY, startX, y)
                            converter.startPoint = Vec2(x, startY)
                            converter.endPoint = Vec2(startX, y)
                        }
                        path.reset()
                        pathFill.reset()
                        pathFill.addRect(rect, Path.Direction.CCW)
                        path.addRect(rect, Path.Direction.CCW)
                    }
                    Drawer.ELLIPSE -> {
                        hasMoved = true
                        val pathFill = HistoryService.previewListPath[HistoryService.previewListPath.size - 2]
                        val rect = RectF(startX, startY, x, y)
                        converter.startPoint = Vec2(startX, startY)
                        converter.endPoint = Vec2(x, y)
                        pathFill.reset()
                        path.reset()
                        pathFill.addOval(rect, Path.Direction.CCW)
                        path.addOval(rect, Path.Direction.CCW)
                    }
                    else -> {}
                }
            }
            Mode.SELECTION ->{
                if (!isDown || !SelectionService.clickToMove) {
                    return
                }
                SelectionService.onActionMove(event.x, event.y)
                setAnchors()
            }
            else ->{}
        }
    }

    private fun onActionUp(event: MotionEvent) {
        when(mode) {
            Mode.DRAW -> {
                if (isSelectionDown){
                    isSelectionDown = false
                    return
                }
                if (isDown) {

                    if (drawer == Drawer.PEN && converter.listPoints.size <= 1) {
                        HistoryService.currentPreview.moveTo(
                            converter.listPoints[0].x,
                            converter.listPoints[0].y
                        )
                    }

                    startX = 0f
                    startY = 0f
                    isDown = false

                    when (drawer) {
                        Drawer.PEN -> {
                            converter.transformCommandToServer(Converter.CommandType.Pencil)
                            oldDrawer = Drawer.PEN
                        }
                        Drawer.ELLIPSE -> {
                            if (hasMoved) {
                                converter.transformCommandToServer(Converter.CommandType.Ellipse)
                                oldDrawer = Drawer.ELLIPSE
                            }
                        }
                        Drawer.RECTANGLE -> {
                            if (hasMoved && converter.startPoint.x != converter.endPoint.x &&
                                converter.startPoint.y != converter.endPoint.y
                            ) {
                                converter.transformCommandToServer(Converter.CommandType.Rectangle)
                                oldDrawer = Drawer.RECTANGLE
                            }
                        }
                        else -> {
                            oldDrawer = Drawer.NONE
                        }
                    }
                }
                hasMoved = false
            }
            Mode.SELECTION -> if (isDown) {
                if(SelectionService.clickToMove && SelectionService.hasMove) {
                    SelectionService.onActionUp(event.x, event.y)
                    converter.changeCommand(SelectionService.indexSelected)
                    setAnchors()
                }
                isDown = false
                isSelectionDown = false
            }
            else -> {}
        }
    }

    override fun onDraw(canvas: Canvas) {

        this.canvas.drawColor(baseColor)
        this.canvasCode.drawColor(baseColor)

        for (i in 0 until HistoryService.mainPathLists.size) {
            if (HistoryService.mainFillPath[i] != null){
                val path = HistoryService.mainFillPath[i]!!
                val paint = HistoryService.mainFillPaint[i]!!
                val paintID = HistoryService.colorIDFillList[i]
                this.canvas.drawPath(path, paint)
                if(paintID != null)
                    this.canvasCode.drawPath(path, paintID)
            }

            val path = HistoryService.mainPathLists[i]
            val paint = HistoryService.mainPaintLists[i]
            this.canvas.drawPath(path, paint)
            this.canvasCode.drawPath(path, HistoryService.colorIDList[i])

            if(HistoryService.textInShape[i] != null){
                drawText(this.canvas, path, HistoryService.textInShape[i]!!,
                    HistoryService.textColor[i]!!)
            }
            if(HistoryService.commandSelected[i] != null && HistoryService.commandSelected[i] != User.getId()){
                selectedByOtherPaint.set(paint)
                selectedByOtherPaint.color = 0xAAFF0000.toInt()
                this.canvas.drawPath(path,selectedByOtherPaint)
            }
        }

        for (i in 0 until HistoryService.previewListPath.size){
            val path = HistoryService.previewListPath[i]
            val paint = HistoryService.previewPaintLists[i]
            this.canvas.drawPath(path, paint)
        }

        super.onDraw(canvas)
        canvas.drawBitmap(bitmap, 0f, 0f, null)
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> onActionDown(event)
            MotionEvent.ACTION_MOVE -> onActionMove(event)
            MotionEvent.ACTION_UP -> onActionUp(event)
            else -> {}
        }

        // Re draw
        this.invalidate()
        return true
    }

    fun delete(){
        if(SelectionService.isSelected){
            converter.deleteCommand(HistoryService.commandID[SelectionService.indexSelected])
        }
    }

    fun unselect(){
        if(SelectionService.isSelected){
            SelectionService.unSelectShapeBounds()
            contextView.toolFragment.layerAdapter.index = -1
            contextView.toolFragment.unableSelection()
            hideAnchors()
            this.invalidate()
        }
    }

    fun changeStrokeWidth(width : Float){
        if(SelectionService.isSelected && setUpDone){
            SelectionService.changeWidth(width)
            SelectionService.translateMatrix.setTranslate(0f,0f)
            setAnchors()
            converter.changeCommand(SelectionService.indexSelected)
        }
    }

    fun changeStrokeColor(color:Int){
        if(SelectionService.isSelected && setUpDone){
            SelectionService.changeColorStroke(color)
            converter.changeCommand(SelectionService.indexSelected)
        }
    }

    fun changeFillColor(color:Int){
        if(SelectionService.isSelected && setUpDone){
            SelectionService.changeColorFill(color)
            converter.changeCommand(SelectionService.indexSelected)
        }
    }

    fun changeTextColor(color:Int){
        if(SelectionService.isSelected && setUpDone){
            SelectionService.changeColorText(color)
            converter.changeCommand(SelectionService.indexSelected)
        }
    }

    fun onScaleActionDown(x:Float, y:Float){
        SelectionService.onScaleActionDown(x,y)
    }

    fun onScaleActionMove(x:Float, y:Float, button:String, rawX : Float, rawY:Float){
        SelectionService.onScaleActionMove(x,y, button, rawX, rawY , context.resources.displayMetrics.density)
        val tmp = SelectionService.isShape
        SelectionService.unSelectShapeBounds()
        SelectionService.selectShapeBounds()
        SelectionService.isShape = tmp
        setAnchors()
        this.invalidate()
    }

    fun setAnchors(){
        contextView.runOnUiThread{
            SelectionService.setAnchors(buttonUpRight, buttonUpLeft, buttonDownRight,buttonDownLeft,
                context.resources.displayMetrics.density)
        }
    }

    fun hideAnchors(){
        contextView.runOnUiThread {
            SelectionService.hideAnchors(buttonUpRight, buttonUpLeft, buttonDownRight,buttonDownLeft)
        }
    }

    fun onScaleActionUp(){
        converter.changeCommand(SelectionService.indexSelected)
        SelectionService.unSelectShapeBounds()
        SelectionService.selectShapeBounds()
        this.invalidateView()
    }

    fun clear() {
        HistoryService.clear()
        SelectionService.clear()

        // Clear
        this.invalidate()
    }

    fun setPaintStrokeWidth(width: Float) {
        PaintService.paintStrokeWidth = if (width >= 0) {
            width
        } else {
            3f
        }
    }

    fun addListCommand(listCommand : List<JSONObject>){
        converter.transformListCommand(listCommand)
        this.invalidate()
    }

    fun invalidateView(){
        this.invalidate()
    }

    fun updateLayers(){
        contextView.toolFragment.updateLayers()
    }

    fun updateSpecifyLayer(index: Int = -1){
        contextView.toolFragment.updateSpecifyLayer(index)
    }

    fun updateIndexLayer(newIndex:Int){
        contextView.toolFragment.layerAdapter.index = newIndex
    }

    fun removeIndexLayer(index : Int){
        contextView.toolFragment.removeIndexLayer(index)
    }

    fun getIndexLayer():Int{
        return contextView.toolFragment.layerAdapter.index
    }

    fun incrementIndexLayer(){
        contextView.toolFragment.layerAdapter.index++
    }

    fun decrementIndexLayer(){
        contextView.toolFragment.layerAdapter.index--
    }

    fun findName(userID : String, layer : LayersData, layerIndex : Int){
        contextView.lifecycle.coroutineScope.launch {
            layer.userId = IntermediateAlbumServer.getInfoUser(userID)!!.userName
            updateSpecifyLayer(layerIndex)
        }
    }

    private var setUpDone : Boolean = true
    fun setUpSelection(){
        setUpDone = false
        val indexSelected = SelectionService.indexSelected
        if (SelectionService.isShape){
            val paint = HistoryService.mainPaintLists[indexSelected]
            contextView.toolFragment.changeOptions(paint.color, paint.strokeWidth,
                HistoryService.textColor[indexSelected]?.color!!,
                HistoryService.mainFillPaint[indexSelected]?.color)
            SelectionService.checkTransparency(checkBox)
        }
        else{
            val paint = HistoryService.mainPaintLists[indexSelected]
            contextView.toolFragment.changeOptions(paint.color, paint.strokeWidth)
        }

        contextView.runOnUiThread {
            if (!SelectionService.hasMove){
                SelectionService.translateMatrix.setTranslate(0f,0f)
                setAnchors()
            }
            contextView.toolFragment.unselectTool()
            contextView.toolFragment.enableSelection()
            contextView.toolFragment.layerAdapter.index = HistoryService.listLayer.size - 1 - indexSelected
            contextView.toolFragment.updateLayers()
            setUpDone = true
        }
    }

    fun inputText(){
        text.clear()
        val inputMethodManager = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        inputMethodManager.toggleSoftInput(InputMethodManager.SHOW_IMPLICIT, InputMethodManager.HIDE_IMPLICIT_ONLY)
    }

    fun closeInputText(){
        val inputMethodManager = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        inputMethodManager.hideSoftInputFromWindow(rootView.windowToken, 0)
        contextView.toolFragment.showKeyboard = false
        if (SelectionService.isSelected &&  SelectionService.indexSelected != -1 &&
            HistoryService.textInShape[SelectionService.indexSelected] == null){
            contextView.toolFragment.textOff()
        }
    }

    override fun onCreateInputConnection(outAttrs: EditorInfo): InputConnection {
        outAttrs.actionLabel = null
        outAttrs.label = "Test text"
        outAttrs.inputType = InputType.TYPE_NULL
        outAttrs.imeOptions = EditorInfo.IME_ACTION_DONE
        return CustomInputConnection(this, false)
    }
    override fun onCheckIsTextEditor(): Boolean {
        return true
    }

    fun setText(text: CharSequence?){
        Log.d("Char", text.toString())
    }

    fun updateUI(){
        contextView.runOnUiThread {
            if (!SelectionService.isSelected && oldDrawer != Drawer.NONE) {
                when (oldDrawer) {
                    Drawer.PEN -> {
                        contextView.toolFragment.updateUI(Drawer.PEN)
                        mode = Mode.DRAW
                    }
                    Drawer.RECTANGLE -> {
                        contextView.toolFragment.updateUI(Drawer.RECTANGLE)
                        mode = Mode.DRAW
                    }
                    Drawer.ELLIPSE -> {
                        contextView.toolFragment.updateUI(Drawer.ELLIPSE)
                        mode = Mode.DRAW
                    }
                    Drawer.NONE -> {}
                }
                drawer = oldDrawer
                contextView.toolFragment.currentTool = oldDrawer
                oldDrawer = Drawer.NONE
            }
        }
    }
}
