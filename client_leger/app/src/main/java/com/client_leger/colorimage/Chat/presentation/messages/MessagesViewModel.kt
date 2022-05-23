package com.client_leger.colorimage.Chat.presentation.messages

import androidx.lifecycle.*
import com.client_leger.colorimage.Chat.domain.model.Message
import com.client_leger.colorimage.Chat.domain.use_case.MessageUseCases
import com.client_leger.colorimage.Model.User
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import javax.inject.Inject

@HiltViewModel
class MessagesViewModel @Inject constructor(
    private val messageUseCases: MessageUseCases,
    savedStateHandle: SavedStateHandle
) : ViewModel(), LifecycleObserver {

    private val _messageState = MutableStateFlow(MessagesState(emptyList()))
    val messageState: StateFlow<MessagesState> = _messageState

    private val drawingID: String? = savedStateHandle.get<String>("drawingID")

    private val _exceptionMessage: MutableLiveData<String> by lazy {
        MutableLiveData<String>()
    }
    val exceptionMessage = _exceptionMessage.asFlow()

    private val handler = CoroutineExceptionHandler { _, exception ->
        _exceptionMessage.value = exception.message.toString()
    }

    private var receiveMessageScope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var activeRoom: String

    private fun onNewChannel(channelName: String) {
        if (channelName == "") return
        receiveMessageScope.coroutineContext.cancelChildren()
        activeRoom = channelName
        getMessageHistory()
        receiveMessages()
    }

    fun onEvent(event: MessagesEvent) {
        when (event) {
            is MessagesEvent.SendMessage -> {
                sendMessage(event.message)
            }
            is MessagesEvent.ChangeChannel -> {
                onNewChannel(event.roomName)
            }
        }
    }

    private fun getMessageHistory() {
        viewModelScope.launch(handler) {
            messageUseCases.getMessageHistory(
                activeRoom,
                drawingID
            ).also { messageList ->
                _messageState.value = MessagesState(messageList.getOrThrow())
            }
        }
    }

    private fun receiveMessages() {
        if (!receiveMessageScope.isActive) {
            receiveMessageScope = CoroutineScope(Dispatchers.Main + Job())
        }
        receiveMessageScope.launch(handler) {
            messageUseCases.receiveMessage(activeRoom, drawingID).onEach { message ->
                _messageState.value = MessagesState(messageState.value.messages.toList() + message)
            }.cancellable().collect()
        }
    }

    private fun sendMessage(message: String) {
        val newMessage = Message("", "", User.getUsername(), message, activeRoom)
        viewModelScope.launch(handler) {
            messageUseCases.sendMessage(newMessage, drawingID)
        }
    }
}
