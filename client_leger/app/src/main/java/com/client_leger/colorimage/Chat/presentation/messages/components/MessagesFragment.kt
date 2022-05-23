package com.client_leger.colorimage.Chat.presentation.messages.components

import android.graphics.Color
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.doOnPreDraw
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.client_leger.colorimage.Chat.presentation.channels.ChannelsEvent
import com.client_leger.colorimage.Chat.presentation.channels.SharedChatViewModel
import com.client_leger.colorimage.Chat.presentation.messages.MessagesEvent
import com.client_leger.colorimage.Chat.presentation.messages.MessagesViewModel
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.ChatMessagesFragmentBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

@AndroidEntryPoint
class MessagesFragment : Fragment() {

    private lateinit var binding: ChatMessagesFragmentBinding
    private val messagesViewModel: MessagesViewModel by activityViewModels()
    private val chatViewModel: SharedChatViewModel by activityViewModels()
    private val messagesAdapter = MessagesAdapter()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = ChatMessagesFragmentBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecycler()
        setupMessageReception()
        setupRoomChange()
        setupErrorMessage()
        binding.sendMessage.setOnClickListener {
            sendMessage()
        }
        binding.chatMessageInput.setOnKeyListener(View.OnKeyListener{ v, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP){
                sendMessage()
                return@OnKeyListener true
            }
            false
        })
        binding.messageListRecyclerView.addOnLayoutChangeListener { v, left, top, right, bottom, oldleft, oldtop, oldright, oldBottom ->
            if (bottom < oldBottom) {
                binding.messageListRecyclerView.postDelayed(Runnable {
                    binding.messageListRecyclerView.smoothScrollToPosition(if (messagesAdapter.currentList.isEmpty()) 0 else messagesAdapter.currentList.size - 1) }, 100)
            }
        }

    }

    private fun sendMessage() {
        val message: String = binding.chatMessageInput.text.toString()
        val filteredMessage = message.replace("[\\t\\n\\r ]+".toRegex(), "")
        if (filteredMessage.isEmpty()) {
            clearMessageInput()
            return
        }

        messagesViewModel.onEvent(MessagesEvent.SendMessage(message))
        clearMessageInput()
    }

    private fun clearMessageInput() {
        binding.chatMessageInput.text.clear()
    }

    private fun setupRecycler() {
        binding.messageListRecyclerView.adapter = messagesAdapter

        postponeEnterTransition()
        view?.doOnPreDraw { startPostponedEnterTransition() }
    }

    private fun setupMessageReception() {
        messagesViewModel.messageState.onEach {
            val diff = messagesAdapter.submitListDiff(it.messages)
            delay(70)
            if (diff == 1)
                binding.messageListRecyclerView.smoothScrollToPosition(if (it.messages.isEmpty()) 0 else it.messages.size - 1)
            else
                binding.messageListRecyclerView.scrollToPosition(if (it.messages.isEmpty()) 0 else it.messages.size - 1)
        }.launchIn(lifecycleScope)
    }

    private fun setupRoomChange() {
        chatViewModel.activeRoomState.onEach {
            if (it != "") {
                binding.roomName.text = it
                messagesViewModel.onEvent(MessagesEvent.ChangeChannel(it))
                binding.chatMessageInput.requestFocus()
            }
        }.launchIn(lifecycleScope)
    }

    private fun setupErrorMessage() {
        messagesViewModel.exceptionMessage.onEach {
            handleError(it)
        }.launchIn(lifecycleScope)
    }

    private fun displayError(messageError: String) {
        if (messageError.isEmpty()) return
        val snackbar = Snackbar.make(
            requireActivity().findViewById(R.id.chat_coordinator_layout),
            messageError,
            3000
        )
        snackbar.setTextColor(Color.RED)
        snackbar.show()
    }

    private fun handleError(errorMessage: String) {
        if (errorMessage == "Unauthorized" || errorMessage == "Forbidden resource") {
            CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(parentFragmentManager, "Error")
        } else if (errorMessage == "Room don't exist") {
            chatViewModel.onEvent(ChannelsEvent.ChangeRoom(chatViewModel.activeRoomState.value))
        } else displayError(errorMessage)
    }
}
