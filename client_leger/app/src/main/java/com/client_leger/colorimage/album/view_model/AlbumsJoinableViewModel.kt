package com.client_leger.colorimage.album.view_model

import com.client_leger.colorimage.album.data.AlbumJoinableData

class AlbumsJoinableViewModel(private val albumJoinableData: AlbumJoinableData) {
    val albumName: String = this.albumJoinableData.albumName
    val albumId: String = this.albumJoinableData.albumId
    val description: String = this.albumJoinableData.description
    var requestPending : Boolean = this.albumJoinableData.requestPending
}
