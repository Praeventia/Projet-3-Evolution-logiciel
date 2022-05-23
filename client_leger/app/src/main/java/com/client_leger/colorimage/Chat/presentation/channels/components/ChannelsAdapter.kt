package com.client_leger.colorimage.Chat.presentation.channels.components

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import org.w3c.dom.Text
import java.lang.Exception

private const val DEFAULT_CHANNEL = 0
private const val NORMAL_CHANNEL = 1

class ChannelsAdapter(
    private val onItemClicked: (channel: String) -> Unit,
    private val onItemTrashClicked: (channel: String) -> Unit,
    private val onItemLeaveClicked: (channel: String) -> Unit,
) : ListAdapter<String, ChannelsAdapter.ChannelViewHolder>(StringDiffCallback) {

    fun changeSelected(channel: String) {
        if (channel == "") return
        var selectedPosition = currentList.indexOf(channel)
        if (selectedPosition == -1) {
            selectedPosition = currentList.size
        }
        val oldSelected = selectedPos
        selectedPos = selectedPosition
        notifyItemChanged(selectedPosition)
        notifyItemChanged(oldSelected)
    }

    private var selectedPos = 0

    class ChannelViewHolder(
        itemView: View,
        private val onItemClicked: (channel: String) -> Unit,
        private val onItemTrashClicked: (channel: String) -> Unit,
        private val onItemLeaveClicked: (channel: String) -> Unit
    ) : RecyclerView.ViewHolder(itemView), View.OnClickListener {
        private val channelNameTextView: TextView = itemView.findViewById(R.id.roomName)
        private var trashButton: ImageView? = null
        private var leaveButton: ImageView? = null
        private val unreadCount: TextView = itemView.findViewById(R.id.unread_count)

        init {
            itemView.setOnClickListener(this)
            if (itemView.id == R.id.item_room_layout) {
                trashButton = itemView.findViewById(R.id.delete_button)
                leaveButton = itemView.findViewById(R.id.leave_button)
            }
        }

        fun bind(roomName: String) {
            if (UnreadMessageTracker.unreadMessagesState.value.unreadMessagesChannels[roomName] != null) {
                unreadCount.visibility = View.VISIBLE
                unreadCount.text = UnreadMessageTracker.unreadMessagesState.value.unreadMessagesChannels[roomName].toString()
            }
            if (UnreadMessageTracker.unreadMessagesState.value.unreadMessagesChannels[roomName] == null) {
                unreadCount.visibility = View.GONE
            }

            channelNameTextView.text = roomName
            trashButton?.setOnClickListener { _ ->
                onItemTrashClicked(channelNameTextView.text.toString())
            }
            leaveButton?.setOnClickListener { _ ->
                onItemLeaveClicked(channelNameTextView.text.toString())
            }
        }

        override fun onClick(v: View) {
            onItemClicked(channelNameTextView.text.toString())
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChannelViewHolder {
        val itemView: View
        when (viewType) {
            DEFAULT_CHANNEL -> {
                itemView = LayoutInflater.from(parent.context)
                    .inflate(R.layout.item_room_layout_without_buttons, parent, false)
            }
            else -> {
                itemView = LayoutInflater.from(parent.context)
                    .inflate(R.layout.item_room_layout, parent, false)
            }
        }
        return ChannelViewHolder(itemView, onItemClicked, onItemTrashClicked, onItemLeaveClicked)
    }

    override fun onBindViewHolder(holder: ChannelViewHolder, position: Int) {
        holder.itemView.isSelected = selectedPos == position
        val message = getItem(position)
        holder.bind(message)
    }

    override fun getItemViewType(position: Int): Int {
        if (getItem(position) == Constants.DEFAULT_CHANNEL || getItem(position) == Constants.DEFAULT_DRAWING_CHANNEL)
            return DEFAULT_CHANNEL
        else
            return NORMAL_CHANNEL
    }
}

object StringDiffCallback : DiffUtil.ItemCallback<String>() {
    override fun areItemsTheSame(oldItem: String, newItem: String): Boolean {
        return oldItem == newItem
    }

    override fun areContentsTheSame(oldItem: String, newItem: String): Boolean {
        return oldItem == newItem
    }
}
