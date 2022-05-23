package com.client_leger.colorimage.album.view_model

import com.client_leger.colorimage.album.data.UserData

class UserToAlbumViewModel(userData : UserData) {
    val userName : String = userData.userName
    val userID : String = userData.userID
}
