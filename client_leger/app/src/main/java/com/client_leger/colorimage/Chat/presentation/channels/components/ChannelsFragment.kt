package com.client_leger.colorimage.Chat.presentation.channels.components

import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.AutoCompleteTextView
import androidx.core.view.doOnPreDraw
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.presentation.channels.ChannelsEvent
import com.client_leger.colorimage.Chat.presentation.channels.SharedChatViewModel
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.ChatChannelsFragmentBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.lang.Exception


class ChannelsFragment : Fragment() {

    private lateinit var binding: ChatChannelsFragmentBinding
    private val chatViewModel: SharedChatViewModel by activityViewModels()
    private val channelsAdapter = ChannelsAdapter(
        { channel -> onListItemClick(channel) },
        { channel -> onDeleteItemClick(channel) },
        { channel -> onLeaveItemClick(channel) })

    private val onJoinRoomClick = { position: Int -> onJoinRoomItemClick(position) }

    private fun onJoinRoomItemClick(position: Int) {
        val first: String =
            (binding.autoCompleteTextView2.adapter as AutocompleteChannelsAdapter).mRooms[position]
        chatViewModel.onEvent(ChannelsEvent.JoinRoom(first))
        binding.autoCompleteTextView2.text.clear()
        binding.autoCompleteTextView2.dismissDropDown()
    }

    private fun onDeleteItemClick(channel: String) {
        chatViewModel.onEvent(ChannelsEvent.DeleteRoom(channel))
    }

    private fun onLeaveItemClick(channel: String) {
        chatViewModel.onEvent(ChannelsEvent.LeaveRoom(channel))
    }

    private fun onListItemClick(channel: String) {
        chatViewModel.onEvent(ChannelsEvent.ChangeRoom(channel))
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = ChatChannelsFragmentBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupView()
        setupRecycler()
        setAvailableRooms()

        binding.createRoomText.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus)
                hideRoomCreation()
        }

        binding.createRoomButton.setOnClickListener {
            showRoomCreation()
        }
        binding.createRoomConfirmButton.setOnClickListener {
            createChannel()
        }
        binding.createRoomText.setOnKeyListener(View.OnKeyListener { v, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                createChannel()
            }
            false
        })
        binding.autoCompleteTextView2.setOnKeyListener(View.OnKeyListener { v, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP && binding.autoCompleteTextView2.text.isNotEmpty()) {
                try { onJoinRoomItemClick(0) } catch (e: Exception) {}
            } else if (keyCode == KeyEvent.KEYCODE_DEL && event.action == KeyEvent.ACTION_DOWN && binding.autoCompleteTextView2.text.length == 1) {
                lifecycleScope.launch {
                    delay(20)
                    requireView().findViewById<AutoCompleteTextView>(R.id.autoCompleteTextView2)
                        .showDropDown()
                }
            }
            false
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        UnreadMessageTracker.activeRoomState =""
    }

    private fun showRoomCreation() {
        binding.createRoomButton.visibility = View.INVISIBLE
        binding.createRoomText.visibility = View.VISIBLE
        binding.createRoomConfirmButton.visibility = View.VISIBLE
        binding.createRoomText.requestFocus()
        val imm =
            requireContext().getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.showSoftInput(binding.createRoomText, InputMethodManager.SHOW_IMPLICIT)
    }

    private fun hideRoomCreation() {
        binding.createRoomText.text.clear()
        binding.createRoomText.visibility = View.INVISIBLE
        binding.createRoomConfirmButton.visibility = View.INVISIBLE
        binding.createRoomButton.visibility = View.VISIBLE
        binding.createRoomText.clearFocus()
        val imm =
            requireContext().getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(requireView().windowToken, 0)
    }

    private fun createChannel() {
        chatViewModel.onEvent(ChannelsEvent.CreateRoom(binding.createRoomText.text.toString()))
        hideRoomCreation()
    }

    private fun setupRecycler() {
        binding.channelListRecyclerView.adapter = channelsAdapter

        postponeEnterTransition()
        view?.doOnPreDraw { startPostponedEnterTransition() }
    }

    private fun setupView() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                UnreadMessageTracker.unreadMessagesState.onEach {
                    channelsAdapter.notifyItemChanged(channelsAdapter.currentList.indexOf(it.lastChannelUnreadChange))
                }.collect()
            }
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                chatViewModel.joinedRoomsState.onEach {
                    channelsAdapter.submitList(it)
                }.collect()
            }
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                chatViewModel.exceptionMessage.onEach {
                    handleError(it)
                }.collect()
            }
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                chatViewModel.statusMessage.onEach {
                    displayMessage(it)
                }.collect()
            }
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                chatViewModel.activeRoomState.onEach {
                    channelsAdapter.changeSelected(it)
                }.collect()
            }
        }
    }

    private fun handleError(errorMessage: String) {
        if (errorMessage == "Unauthorized" || errorMessage == "Forbidden resource") {
            CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(parentFragmentManager, "Error")
        } else if (errorMessage == "Room don't exist") {
            chatViewModel.onEvent(ChannelsEvent.ChangeRoom(chatViewModel.activeRoomState.value))
        } else displayError(errorMessage)
    }

    private fun displayMessage(message: String) {
        if (message.isEmpty()) return
        val snackbar = Snackbar.make(
            requireActivity().findViewById(R.id.chat_coordinator_layout),
            message,
            2500
        )
        snackbar.setTextColor(Color.GREEN)
        snackbar.show()
    }

    private fun displayError(messageError: String) {
        if (messageError.isEmpty()) return
        val snackbar = Snackbar.make(
            requireActivity().findViewById(R.id.chat_coordinator_layout),
            messageError,
            2500
        )
        snackbar.setTextColor(Color.RED)
        snackbar.show()
    }

    private fun setAvailableRooms() {
        binding.autoCompleteTextView2.threshold = 1
        binding.autoCompleteTextView2.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                binding.autoCompleteTextView2.showDropDown()
                chatViewModel.onEvent(ChannelsEvent.RefreshJoinableRooms)
            } else {
                binding.autoCompleteTextView2.text.clear()
                binding.autoCompleteTextView2.dismissDropDown()
            }
        }
        binding.autoCompleteTextView2.setOnClickListener {
            binding.autoCompleteTextView2.showDropDown()
            chatViewModel.onEvent(ChannelsEvent.RefreshJoinableRooms)
        }
        chatViewModel.availableRoomsState.onEach {
            val adapter = AutocompleteChannelsAdapter(
                requireContext(),
                android.R.layout.simple_dropdown_item_1line,
                it,
                onJoinRoomClick
            )
            binding.autoCompleteTextView2.setAdapter(adapter)

            if (requireView().windowToken != null && binding.autoCompleteTextView2.hasFocus()) requireView().findViewById<AutoCompleteTextView>(
                R.id.autoCompleteTextView2
            ).showDropDown()

        }.launchIn(lifecycleScope)
    }
}
