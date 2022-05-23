package com.client_leger.colorimage.album.view_model

import com.client_leger.colorimage.album.data.DrawingData
import com.client_leger.colorimage.Model.User

class DrawingViewModel(drawingData: DrawingData) {
    val creationDate : String = drawingData.creationDate
    var drawingName :String  = drawingData.drawingName
    val drawingId : String = drawingData.drawingId
    var ownerName : String = drawingData.owner
    var numberOfPeopleEditing : String = drawingData.numberOfPeopleEditing
    var albumId : String = drawingData.albumId
    val isOwner : Boolean = drawingData.isOwner
    val needPassword: Boolean = drawingData.needPassword
    var isExposed : Boolean = drawingData.isExposed
}
