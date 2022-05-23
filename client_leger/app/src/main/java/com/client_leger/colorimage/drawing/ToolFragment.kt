package com.client_leger.colorimage.drawing


import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.coroutineScope
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.presentation.ChatActivity
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.client_leger.colorimage.drawing.adapter.LayersAdapter
import com.client_leger.colorimage.drawing.adapter.UserInDrawingAdapters
import com.client_leger.colorimage.drawing.canvas_view.CanvasView
import com.client_leger.colorimage.drawing.intermediate.IntermediateDrawingServer
import com.client_leger.colorimage.drawing.services.HistoryService
import com.client_leger.colorimage.drawing.services.PaintService
import com.client_leger.colorimage.drawing.services.SelectionService
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import top.defaults.colorpicker.ColorPickerPopup
import top.defaults.colorpicker.ColorPickerView


class ToolFragment : Fragment(R.layout.fragment_tool_bar) {

    private lateinit var buttonUpRight : ImageView
    private lateinit var buttonUpLeft : ImageView
    private lateinit var buttonDownRight : ImageView
    private lateinit var buttonDownLeft : ImageView

    private lateinit var strokeColorPickerView : ColorPickerView
    private lateinit var fillColorPickerView : ColorPickerView
    private lateinit var textColorPickerView : ColorPickerView

    private var INITIAL_COLOR1 = 0xFFFFFFFF
    private var INITIAL_COLOR2 = 0xFF000000

    lateinit var drawingActivity: DrawingActivity
    private lateinit var penButton : ImageView
    private lateinit var rectButton : ImageView
    private lateinit var ellipseButton : ImageView
    private lateinit var trashButton : ImageView
    private lateinit var pickedStrokeColor : View
    private lateinit var pickedFillColor : View
    private lateinit var pickedTextColor : View
    private lateinit var sliderStroke : SeekBar
    private lateinit var selection : ImageView
    private lateinit var textButton : ImageView
    private lateinit var fond : CheckBox

    private lateinit var layerButton : ImageView
    private lateinit var peopleButton : ImageView
    private lateinit var moveBottom: ImageView
    private lateinit var moveDown: ImageView
    private lateinit var moveUp: ImageView
    private lateinit var moveTop: ImageView
    lateinit var layerAdapter : LayersAdapter
    lateinit var userAdapter : UserInDrawingAdapters
    private var layerIsOn : Boolean = true
    private var peopleIsOn: Boolean = false
    var showKeyboard : Boolean = false
    private lateinit var jobRefreshPeople : Job

    lateinit var currentTool : CanvasView.Drawer

    @SuppressLint("ClickableViewAccessibility")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {

        // Options for draw
        penButton = view.findViewById(R.id.pen)
        rectButton = view.findViewById(R.id.rect)
        ellipseButton = view.findViewById(R.id.ellipse)
        trashButton = view.findViewById(R.id.delete)
        pickedStrokeColor = view.findViewById(R.id.pickedColor1)
        pickedFillColor = view.findViewById(R.id.pickedColor2)
        pickedTextColor =  view.findViewById(R.id.pickedColor3)
        sliderStroke = view.findViewById(R.id.seekbar_width)
        selection = view.findViewById(R.id.selection)
        textButton = view.findViewById(R.id.text)
        fond = view.findViewById(R.id.checkBox)

        // Options recycleview
        layerButton = view.findViewById(R.id.drawingLayers)
        layerAdapter = LayersAdapter(this)
        view.findViewById<RecyclerView>(R.id.layers).adapter = layerAdapter
        peopleButton = view.findViewById(R.id.people)
        userAdapter = UserInDrawingAdapters(this)
        view.findViewById<RecyclerView>(R.id.peopleRecycleView).adapter = userAdapter

        moveBottom = view.findViewById(R.id.MoveToBottom)
        moveDown = view.findViewById(R.id.MoveDown)
        moveUp = view.findViewById(R.id.MoveUp)
        moveTop = view.findViewById(R.id.MoveToTop)


        buttonUpRight = view.findViewById(R.id.dot_up_right)
        buttonUpLeft = view.findViewById(R.id.dot_up_left)
        buttonDownRight = view.findViewById(R.id.dot_down_right )
        buttonDownLeft = view.findViewById(R.id.dot_down_left)

        drawingActivity = activity as DrawingActivity

        drawingActivity.canvasView.buttonUpRight = buttonUpRight
        drawingActivity.canvasView.buttonUpLeft = buttonUpLeft
        drawingActivity.canvasView.buttonDownRight = buttonDownRight
        drawingActivity.canvasView.buttonDownLeft = buttonDownLeft
        drawingActivity.canvasView.checkBox = fond

        strokeColorPickerView = ColorPickerView(activity)
        fillColorPickerView = ColorPickerView(activity)
        textColorPickerView = ColorPickerView(activity)

        currentTool = drawingActivity.canvasView.drawer

        jobRefreshPeople = fetchPeopleInDrawing()

        strokeColorPickerView.subscribe { color, _, _ ->
            PaintService.paintStrokeColor = color
            pickedStrokeColor.backgroundTintList = ColorStateList.valueOf(color)
            if(layerAdapter.index != -1) {
                drawingActivity.canvasView.changeStrokeColor(color)
            }
        }

        fillColorPickerView.subscribe { color, _, _ ->
            if (!fond.isChecked){
                PaintService.paintFillColor = color
                pickedFillColor.backgroundTintList = ColorStateList.valueOf(color)
                if(layerAdapter.index != -1) {
                    drawingActivity.canvasView.changeFillColor(color)
                }
            }
        }

        textColorPickerView.subscribe { color, _, _ ->
            if (!fond.isChecked){
                PaintService.textColor = color
                pickedTextColor.backgroundTintList = ColorStateList.valueOf(color)
                if(layerAdapter.index != -1) {
                    drawingActivity.canvasView.changeTextColor(color)
                }
            }
        }

        fond.setOnCheckedChangeListener {
                _, isChecked ->
            if (isChecked){
                PaintService.paintFillColor = Color.TRANSPARENT
                pickedFillColor.backgroundTintList = ColorStateList.valueOf(Color.TRANSPARENT)
                if(layerAdapter.index != -1) {
                    drawingActivity.canvasView.changeFillColor(Color.TRANSPARENT)
                }
            }else{
                PaintService.paintFillColor = fillColorPickerView.color
                pickedFillColor.backgroundTintList = ColorStateList.valueOf(fillColorPickerView.color)
                if(layerAdapter.index != -1){
                    drawingActivity.canvasView.changeFillColor(fillColorPickerView.color)
                }
            }
        }

        penButton.setOnClickListener{
            changeTool(CanvasView.Drawer.PEN)
        }

        rectButton.setOnClickListener{
            changeTool(CanvasView.Drawer.RECTANGLE)
        }

        ellipseButton.setOnClickListener{
            changeTool(CanvasView.Drawer.ELLIPSE)
        }

        trashButton.setOnClickListener{
            drawingActivity.canvasView.delete()
            unableSelection()
            drawingActivity.canvasView.oldDrawer = CanvasView.Drawer.NONE
        }

        pickedStrokeColor.setOnClickListener{
            popup(strokeColorPickerView)
        }

        pickedFillColor.setOnClickListener{
           popup(fillColorPickerView)
        }

        pickedTextColor.setOnClickListener {
            popup(textColorPickerView)
        }

        selection.setOnClickListener {
            if(drawingActivity.canvasView.hasWrite){
                drawingActivity.canvasView.converter.changeCommand(SelectionService.indexSelected)
                drawingActivity.canvasView.closeInputText()
                drawingActivity.canvasView.hasWrite = false
            }
            drawingActivity.canvasView.converter.unselectCommand(HistoryService.commandID[SelectionService.indexSelected])
            drawingActivity.canvasView.oldDrawer = CanvasView.Drawer.NONE
        }

        buttonUpRight.setOnTouchListener { _, motionEvent ->
            when(motionEvent.action){
                MotionEvent.ACTION_DOWN -> {
                    drawingActivity.canvasView.onScaleActionDown(motionEvent.x, motionEvent.y)
                }

                MotionEvent.ACTION_MOVE -> {
                    if (HistoryService.typeLists[SelectionService.indexSelected] == HistoryService.Type.PEN && HistoryService.listPoints[SelectionService.indexSelected].size <= 1)
                    {}
                    else
                        drawingActivity.canvasView.onScaleActionMove(motionEvent.x, motionEvent.y,
                            "buttonUpRight",  motionEvent.rawX, motionEvent.rawY)
                }

                MotionEvent.ACTION_UP -> {
                    drawingActivity.canvasView.onScaleActionUp()
                }
                else -> {}
            }
            true
        }

        buttonUpLeft.setOnTouchListener { _, motionEvent ->
            when(motionEvent.action){
                MotionEvent.ACTION_DOWN -> {
                    drawingActivity.canvasView.onScaleActionDown(motionEvent.x, motionEvent.y)
                }

                MotionEvent.ACTION_MOVE -> {
                    if (HistoryService.typeLists[SelectionService.indexSelected] == HistoryService.Type.PEN && HistoryService.listPoints[SelectionService.indexSelected].size <= 1)
                    {}
                    else
                        drawingActivity.canvasView.onScaleActionMove(motionEvent.x, motionEvent.y,
                            "buttonUpLeft", motionEvent.rawX, motionEvent.rawY)
                }

                MotionEvent.ACTION_UP -> {
                    showButtonScaling()
                    drawingActivity.canvasView.onScaleActionUp()
                }
                else -> {}
            }
            true
        }

        buttonDownRight.setOnTouchListener { _, motionEvent ->
            when(motionEvent.action){
                MotionEvent.ACTION_DOWN -> {
                    drawingActivity.canvasView.onScaleActionDown(motionEvent.x, motionEvent.y)
                }

                MotionEvent.ACTION_MOVE -> {
                    if (HistoryService.typeLists[SelectionService.indexSelected] == HistoryService.Type.PEN && HistoryService.listPoints[SelectionService.indexSelected].size <= 1)
                    {}
                    else
                        drawingActivity.canvasView.onScaleActionMove(motionEvent.x, motionEvent.y,
                            "buttonDownRight",  motionEvent.rawX, motionEvent.rawY)
                }

                MotionEvent.ACTION_UP -> {
                    drawingActivity.canvasView.onScaleActionUp()
                }
                else -> {}
            }
            true
        }

        buttonDownLeft.setOnTouchListener { _, motionEvent ->
            when(motionEvent.action){
                MotionEvent.ACTION_DOWN -> {
                    drawingActivity.canvasView.onScaleActionDown(motionEvent.x, motionEvent.y)
                }

                MotionEvent.ACTION_MOVE -> {
                    if (HistoryService.typeLists[SelectionService.indexSelected] == HistoryService.Type.PEN && HistoryService.listPoints[SelectionService.indexSelected].size <= 1)
                    {}
                    else
                        drawingActivity.canvasView.onScaleActionMove(motionEvent.x, motionEvent.y,
                            "buttonDownLeft", motionEvent.rawX, motionEvent.rawY)
                }

                MotionEvent.ACTION_UP -> {
                    drawingActivity.canvasView.onScaleActionUp()
                }
                else -> {}
            }
            true
        }

        sliderStroke.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            var newProgress = 0
            override fun onProgressChanged(seekBar: SeekBar, progress: Int, fromUser: Boolean) {
                newProgress = progress
                drawingActivity.canvasView.setPaintStrokeWidth(newProgress.toFloat())
                if(layerAdapter.index != -1) {
                    drawingActivity.canvasView.changeStrokeWidth(newProgress.toFloat())
                }
            }

            override fun onStartTrackingTouch(p0: SeekBar?) {
                //no need
            }

            override fun onStopTrackingTouch(seekbar: SeekBar) {
                Toast.makeText(activity, "Épaisseur : $newProgress", Toast.LENGTH_SHORT).show()
                drawingActivity.canvasView.setPaintStrokeWidth(newProgress.toFloat())
                if(layerAdapter.index != -1) {
                    drawingActivity.canvasView.changeStrokeWidth(newProgress.toFloat())
                }
            }
        })

        layerButton.setOnClickListener {
            if (!layerIsOn){
                view.findViewById<FrameLayout>(R.id.LayoutDrawingLayers).visibility = View.VISIBLE
                view.findViewById<FrameLayout>(R.id.LayoutPeople).visibility = View.GONE
                layerIsOn = true
                peopleIsOn = false
                layerButton.setBackgroundResource(R.drawable.button_on)
                peopleButton.setBackgroundResource(R.drawable.button_border)
            }
        }

        peopleButton.setOnClickListener {
            if (!peopleIsOn){
                view.findViewById<FrameLayout>(R.id.LayoutDrawingLayers).visibility = View.GONE
                view.findViewById<FrameLayout>(R.id.LayoutPeople).visibility = View.VISIBLE
                layerIsOn = false
                peopleIsOn = true
                layerButton.setBackgroundResource(R.drawable.button_border)
                peopleButton.setBackgroundResource(R.drawable.button_on)
            }
        }

        moveBottom.setOnClickListener {
            if (SelectionService.isSelected){
                if (layerAdapter.index != layerAdapter.currentList.size-1){
                    val indexSelected = HistoryService.mainPathLists.size - 1 - layerAdapter.index
                    drawingActivity.canvasView.converter.switchCommand(indexSelected, 0)
                }
            }
        }
        moveDown.setOnClickListener {
            if (SelectionService.isSelected){
                if (layerAdapter.index != layerAdapter.currentList.size-1){
                    drawingActivity.canvasView.converter.switchCommand(SelectionService.indexSelected, SelectionService.indexSelected-1)
                }
            }
        }
        moveUp.setOnClickListener {
            if (SelectionService.isSelected) {
                if (layerAdapter.index != 0) {
                    drawingActivity.canvasView.converter.switchCommand(SelectionService.indexSelected, SelectionService.indexSelected+1)
                }
            }
        }
        moveTop.setOnClickListener {
            if (SelectionService.isSelected){
                if (layerAdapter.index != 0){
                    val indexSelected = HistoryService.mainPathLists.size - 1 - layerAdapter.index
                    drawingActivity.canvasView.converter.switchCommand(indexSelected, HistoryService.mainPathLists.size-1)
                }
            }
        }

        textButton.setOnClickListener {
            if (SelectionService.isSelected){
                if (HistoryService.textInShape[SelectionService.indexSelected] == null && !showKeyboard){
                    textButton.setBackgroundResource(R.drawable.button_on)
                    drawingActivity.canvasView.inputText()
                    showKeyboard = true
                }
                else{
                    textButton.setBackgroundResource(R.drawable.button_border)
                    HistoryService.textInShape[SelectionService.indexSelected] = null
                    drawingActivity.canvasView.closeInputText()
                    drawingActivity.canvasView.invalidateView()
                }
            }
        }

        strokeColorPickerView.setInitialColor(INITIAL_COLOR2.toInt())
        fillColorPickerView.setInitialColor(INITIAL_COLOR1.toInt())
        hideOptions()

        (view.findViewById(R.id.chat_info) as View).setOnClickListener {
            activity?.let{
                val intent = Intent (it, ChatActivity::class.java)
                intent.putExtra("drawingID", (requireActivity() as DrawingActivity).drawingID)
                it.startActivity(intent)
            }
        }
        (view.findViewById(R.id.chat_info) as View).visibility = View.VISIBLE
        listenUnreadMessages()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (jobRefreshPeople.isActive)
            jobRefreshPeople.cancel()

    }

    private fun listenUnreadMessages() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                UnreadMessageTracker.unreadMessagesState.onEach {
                    updateUnreadBadge(it.unreadMessagesChannels)
                }.collect()
            }
        }
    }

    private fun updateUnreadBadge(list : Map<String,Int>) {
        val unreadMessages = list.values.sum()

        val messageBadge = view?.findViewById<TextView>(R.id.new_message_badge)

        if (unreadMessages > 0) {
            messageBadge!!.visibility  = View.VISIBLE
            messageBadge.text = unreadMessages.toString()
        }
        else {
            messageBadge!!.visibility  = View.INVISIBLE
        }
    }

    private fun changeTool(tool : CanvasView.Drawer){
        if (currentTool != tool){
            unselectTool()
            unableSelection()
            updateUI(tool)

            drawingActivity.canvasView.drawer = tool
            currentTool = tool
            drawingActivity.canvasView.mode = CanvasView.Mode.DRAW
            drawingActivity.canvasView.unselect()
        }
        else{
            unselectTool()
            drawingActivity.canvasView.mode = CanvasView.Mode.SELECTION
        }
    }

    fun updateUI(tool : CanvasView.Drawer){
        when(tool){
            CanvasView.Drawer.PEN -> {
                penButton.visibility = View.VISIBLE
                penButton.setBackgroundResource(R.drawable.button_on)
                rectButton.visibility = View.GONE
                ellipseButton.visibility = View.GONE
                pickedStrokeColor.visibility = View.VISIBLE
                sliderStroke.visibility = View.VISIBLE
            }
            CanvasView.Drawer.RECTANGLE -> {
                rectButton.setBackgroundResource (R.drawable.button_on)
                rectButton.visibility = View.VISIBLE
                ellipseButton.visibility = View.GONE
                penButton.visibility = View.GONE
                pickedStrokeColor.visibility = View.VISIBLE
                pickedFillColor.visibility = View.VISIBLE
                fond.visibility = View.VISIBLE
                sliderStroke.visibility = View.VISIBLE
            }
            CanvasView.Drawer.ELLIPSE -> {
                ellipseButton.setBackgroundResource (R.drawable.button_on)
                rectButton.visibility = View.GONE
                ellipseButton.visibility = View.VISIBLE
                penButton.visibility = View.GONE
                pickedStrokeColor.visibility = View.VISIBLE
                pickedFillColor.visibility = View.VISIBLE
                fond.visibility = View.VISIBLE
                sliderStroke.visibility = View.VISIBLE
            }
            else -> {}
        }
    }

    private fun popup(colorPickerView: ColorPickerView){
        ColorPickerPopup.Builder(activity).initialColor(colorPickerView.color)
            .enableAlpha(false)
            .okTitle("Choisir")
            .cancelTitle("Annuler")
            .showIndicator(true)
            .showValue(false)
            .onlyUpdateOnTouchEventUp(true)
            .build()
            .show(object : ColorPickerPopup.ColorPickerObserver() {
                override fun onColorPicked(color:Int){
                    colorPickerView.setInitialColor(color)
                }
            })
    }

    fun unselectTool(){
        when(currentTool) {
            CanvasView.Drawer.PEN -> {
                penButton.setBackgroundResource(R.drawable.button_border)
            }
            CanvasView.Drawer.RECTANGLE -> {
                rectButton.setBackgroundResource (R.drawable.button_border)
            }
            CanvasView.Drawer.ELLIPSE -> {
                ellipseButton.setBackgroundResource (R.drawable.button_border)
            }
            else -> {}
        }

        ellipseButton.visibility = View.VISIBLE
        rectButton.visibility = View.VISIBLE
        penButton.visibility = View.VISIBLE
        hideOptions()

        currentTool = CanvasView.Drawer.NONE
    }

    fun enableSelection(){
        trashButton.setBackgroundResource(R.drawable.button_on)
        selection.setBackgroundResource(R.drawable.button_on)
        ellipseButton.visibility = View.GONE
        rectButton.visibility = View.GONE
        penButton.visibility = View.GONE
        trashButton.visibility = View.VISIBLE
        pickedStrokeColor.visibility = View.VISIBLE

        sliderStroke.visibility = View.VISIBLE
        selection.visibility = View.VISIBLE

        if(SelectionService.indexSelected != -1 && HistoryService.typeLists[SelectionService.indexSelected] == HistoryService.Type.STROKE){
            fond.visibility = View.VISIBLE
            pickedFillColor.visibility = View.VISIBLE
            pickedTextColor.visibility = View.VISIBLE
            textButton.visibility = View.VISIBLE

            if (HistoryService.textInShape[SelectionService.indexSelected] != null){
                textButton.setBackgroundResource(R.drawable.button_on)
            }
            else{
                textButton.setBackgroundResource(R.drawable.button_border)
            }
        }

    }

    fun changeOptions(strokeColor :Int, strokeWidth: Float, textColor: Int? = null,fillColor: Int? = null){
        strokeColorPickerView.setInitialColor(strokeColor)
        PaintService.paintStrokeColor = strokeColor
        pickedStrokeColor.backgroundTintList = ColorStateList.valueOf(strokeColor)
        sliderStroke.progress = strokeWidth.toInt()

        if (fillColor!= null){
            if(fillColor != Color.TRANSPARENT)
                fillColorPickerView.setInitialColor(fillColor)

            PaintService.paintFillColor = fillColor
            pickedFillColor.backgroundTintList = ColorStateList.valueOf(fillColor)
        }

        if (textColor != null){
            textColorPickerView.setInitialColor(textColor)
            PaintService.textColor = textColor
            pickedTextColor.backgroundTintList = ColorStateList.valueOf(textColor)
        }
    }

    fun unableSelection(){
        drawingActivity.runOnUiThread {
            trashButton.setBackgroundResource(R.drawable.button_border)
            selection.setBackgroundResource(R.drawable.button_border)
            hideOptions()
            ellipseButton.visibility = View.VISIBLE
            rectButton.visibility = View.VISIBLE
            penButton.visibility = View.VISIBLE
        }
    }

    private fun hideOptions(){
        trashButton.visibility = View.GONE
        pickedStrokeColor.visibility = View.GONE
        pickedFillColor.visibility = View.GONE
        sliderStroke.visibility = View.GONE
        selection.visibility = View.GONE
        fond.visibility = View.GONE
        pickedTextColor.visibility = View.GONE
        textButton.visibility = View.GONE
    }

    private fun showButtonScaling(){
        buttonUpRight.visibility = View.VISIBLE
        buttonUpLeft.visibility = View.VISIBLE
        buttonDownRight.visibility = View.VISIBLE
        buttonDownLeft.visibility = View.VISIBLE
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun fetchPeopleInDrawing(): Job{
        return lifecycle.coroutineScope.launch(context = Dispatchers.Main) {
            while (isActive) {
                val listUser = IntermediateDrawingServer.connectedUserInDrawing(drawingActivity.drawingID)
                if (listUser !=null){
                    userAdapter.submitList(listUser)
                }
                else{
                    CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(
                        parentFragmentManager,
                        "Error"
                    )
                    this.cancel()
                }
                delay(5000)
            }
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    fun updateLayers(){
        drawingActivity.runOnUiThread {
            layerAdapter.submitList(HistoryService.listLayer)
            layerAdapter.notifyDataSetChanged()
        }
    }

    fun updateSpecifyLayer(index: Int = -1){
        drawingActivity.runOnUiThread {
            if (index == -1)
                layerAdapter.notifyItemChanged(layerAdapter.index)
            else
                layerAdapter.notifyItemChanged(index)
        }
    }

    fun removeIndexLayer(index : Int){
        drawingActivity.runOnUiThread {
            layerAdapter.notifyItemRemoved(index)
        }
    }

    fun textOff(){
        textButton.setBackgroundResource(R.drawable.button_border)
    }
}
