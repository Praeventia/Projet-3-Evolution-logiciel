package com.client_leger.colorimage.album.data

data class AlbumData(
    var albumName: String = "",
    val albumId: String = "",
    var description: String = "",
    val isOwner : Boolean = false,
    val isJoin : Boolean = false,
    val isPublic : Boolean = albumName == "Public"
)
