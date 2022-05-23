package com.client_leger.colorimage.album.view_model

import com.client_leger.colorimage.album.data.AlbumData
import com.client_leger.colorimage.Model.User

class AlbumsViewModel(private val albumData: AlbumData) {
    var albumName: String = this.albumData.albumName
    val albumId: String = this.albumData.albumId
    var description: String = this.albumData.description
    val isOwner : Boolean = this.albumData.isOwner
    val isJoin = this.albumData.isJoin
    val isPublic = this.albumData.isPublic
}
