package com.client_leger.colorimage.album.data

data class AlbumJoinableData(
    val albumName: String = "",
    val albumId: String = "",
    val description: String = "",
    var requestPending : Boolean = false,
)
