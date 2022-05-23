package com.client_leger.colorimage.drawing

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.lifecycle.coroutineScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.R
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.client_leger.colorimage.drawing.canvas_view.CanvasView
import com.client_leger.colorimage.drawing.converter.Converter
import com.client_leger.colorimage.drawing.intermediate.IntermediateDrawingServer
import com.client_leger.colorimage.drawing.services.HistoryService
import com.client_leger.colorimage.drawing.services.PaintService
import com.client_leger.colorimage.drawing.services.SelectionService
import kotlinx.coroutines.launch

class DrawingActivity : AppCompatActivity() {

    lateinit var canvasView : CanvasView
    lateinit var toolFragment: ToolFragment
    lateinit var drawingID : String
    var password : String? = null
    var isOwner: Boolean = false

    private lateinit var fragmentManager: FragmentManager
    private lateinit var currentFragment: Fragment
    private lateinit var converter: Converter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val loading = LoadingDialog(this)
        drawingID = intent.getStringExtra("drawingID")!!
        isOwner = intent.getBooleanExtra("isOwner", false)
        password = intent.getStringExtra("password")
        converter = Converter(drawingID, password)
        setContentView(R.layout.activity_drawing_editor)

        this.canvasView = this.findViewById(R.id.canvas) as CanvasView
        this.canvasView.converter = converter

        canvasView.clear()
        SelectionService.unSelectShapeBounds()
        PaintService.setDefault()

        lifecycle.coroutineScope.launch {
            loading.startLoadingDialog()
            val list = IntermediateDrawingServer.allCommandsInDrawing(drawingID)
            if (list != null){
                canvasView.addListCommand(list)
            }
            else{
                CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE ).show(fragmentManager, "Error")
            }
            val listSelected = IntermediateDrawingServer.allCommandsSelected(drawingID)
            if (listSelected != null){
                listSelected.forEach {
                    it.keys.forEach { key ->
                        val index = HistoryService.commandID.indexOf(key)
                        if(index != -1) {
                            HistoryService.commandSelected[index] = it[key]
                            val indexLayer = HistoryService.listLayer.size - 1 - index
                            canvasView.findName(
                                it[key]!!,
                                HistoryService.listLayer[indexLayer],
                                indexLayer
                            )
                        }
                    }
                }
            }
            converter.connect()
            loading.dismissDialog()
        }

        converter.canvasView = canvasView
        SelectionService.converter = converter

        fragmentManager = supportFragmentManager
        toolFragment = supportFragmentManager.findFragmentById(R.id.fragment_container_view) as ToolFragment
        currentFragment = toolFragment
    }


    override fun onDestroy() {
        converter.disconnect()
        super.onDestroy()
    }

}
