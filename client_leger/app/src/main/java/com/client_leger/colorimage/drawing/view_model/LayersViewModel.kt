package com.client_leger.colorimage.drawing.view_model

import android.graphics.Color
import com.client_leger.colorimage.drawing.data.LayersData

class LayersViewModel(layerData : LayersData) {
    val shapeName : String = layerData.shapeType
    var strokeColor : Int = layerData.strokeColor
    var fillColor:Int = layerData.fillColor
    var width: String = layerData.width
    var isTransparent = fillColor == Color.TRANSPARENT
    var selectedBy : String = "Sélectionné par : "
}
