package com.client_leger.colorimage.Chat.presentation.messages.components

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Connection.SignUpTempVariable
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.R
import com.client_leger.colorimage.Model.User
import com.squareup.picasso.MemoryPolicy
import com.squareup.picasso.NetworkPolicy
import com.squareup.picasso.Picasso
import de.hdodenhof.circleimageview.CircleImageView
import java.time.format.DateTimeFormatter

private const val MESSAGE_FROM_SERVER: Int = 0
private const val MESSAGE_TO_SERVER: Int = 1
private const val MESSAGE_INFO: Int = 2

class MessagesAdapter :
    ListAdapter<Message, MessagesAdapter.MessageViewHolder>(MessageDiffCallback) {

    class MessageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val messageSenderTextView: TextView = itemView.findViewById(R.id.message_sender)
        private val messageContentTextView: TextView = itemView.findViewById(R.id.message_content)
        private val messageTimestampTextView: TextView =
            itemView.findViewById(R.id.message_timestamp)
        private var currentMessage: Message? = null

        fun bind(message: Message) {
            currentMessage = message

            messageSenderTextView.text = message.username
            messageContentTextView.text = message.message
            messageTimestampTextView.text = message.timestamp

            if (itemViewType == MESSAGE_FROM_SERVER) {
                Picasso.get()
                    .load(Constants.USER_AVATAR_URL + message.username)
                    .into(itemView.findViewById(R.id.avatar_image) as CircleImageView)
            }
        }
    }

    private var lastListLength = 0

    fun submitListDiff(list: List<Message>): Int {
        super.submitList(list)
        val diff = list.size - lastListLength
        lastListLength = list.size
        return diff
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val itemView: View

        when (viewType) {
            MESSAGE_FROM_SERVER -> {
                itemView = LayoutInflater.from(parent.context)
                    .inflate(R.layout.message_layout_from_server, parent, false)
            }
            MESSAGE_TO_SERVER -> {
                itemView = LayoutInflater.from(parent.context)
                    .inflate(R.layout.message_layout_to_server, parent, false)
            }
            else -> {
                itemView = LayoutInflater.from(parent.context)
                    .inflate(R.layout.message_layout_info, parent, false)
            }
        }
        return MessageViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        val message = getItem(position)
        holder.bind(message)
    }

    override fun getItemViewType(position: Int): Int {
        if (getItem(position).username == User.getUsername())
            return MESSAGE_TO_SERVER
        else if (getItem(position).username == "server")
            return MESSAGE_INFO
        else
            return MESSAGE_FROM_SERVER
    }
}

object MessageDiffCallback : DiffUtil.ItemCallback<Message>() {
    override fun areItemsTheSame(oldItem: Message, newItem: Message): Boolean {
        return oldItem == newItem
    }

    override fun areContentsTheSame(oldItem: Message, newItem: Message): Boolean {
        return oldItem.message == newItem.message && oldItem.timestamp == newItem.timestamp
    }
}
