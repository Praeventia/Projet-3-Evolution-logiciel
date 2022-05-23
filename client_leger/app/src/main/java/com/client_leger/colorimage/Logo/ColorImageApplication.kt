package com.client_leger.colorimage.Logo

import android.app.Application
import android.media.MediaPlayer
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.R
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ColorImageApplication : Application() {
    private lateinit var newMessageSound: MediaPlayer

    override fun onCreate() {
        super.onCreate()
        instance = this
        newMessageSound = MediaPlayer.create(applicationContext, R.raw.new_message)
        UnreadMessageTracker.mediaPlayer = newMessageSound
    }

    companion object {
        lateinit var instance: ColorImageApplication
            private set
    }
}
