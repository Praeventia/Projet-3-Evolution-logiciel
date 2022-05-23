package com.client_leger.colorimage.album

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.presentation.ChatActivity
import com.client_leger.colorimage.R
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class AlbumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_album)
        listenUnreadMessages()

        findViewById<View>(R.id.chat_info).setOnClickListener {
            val intent = Intent (this, ChatActivity::class.java)
            startActivity(intent)
        }
    }

    private fun listenUnreadMessages() {
        UnreadMessageTracker.unreadMessagesState.onEach {
            updateUnreadBadge(it.unreadMessagesChannels)
        }.launchIn(lifecycleScope)
    }

    private fun updateUnreadBadge(list : Map<String,Int>) {
        val unreadMessages = list.values.sum()

        val messageBadge = findViewById<TextView>(R.id.new_message_badge)

        if (unreadMessages > 0) {
            messageBadge!!.visibility  = View.VISIBLE
            messageBadge.text = unreadMessages.toString()
        }
        else {
            messageBadge!!.visibility  = View.INVISIBLE
        }
    }
}
