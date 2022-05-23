package com.client_leger.colorimage.Chat.presentation.channels

import androidx.lifecycle.*
import com.client_leger.colorimage.Api.Drawing.DrawingHttpRequest
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.domain.use_case.RoomUseCases
import com.client_leger.colorimage.Constants.Constants
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.lang.Exception
import javax.inject.Inject

@HiltViewModel
class SharedChatViewModel @Inject constructor(
    private val roomUseCases: RoomUseCases,
    savedStateHandle: SavedStateHandle
) : ViewModel(), LifecycleObserver {

    private val _joinedRoomsState = MutableStateFlow(emptyList<String>())
    val joinedRoomsState: StateFlow<List<String>> = _joinedRoomsState

    private val _availableRoomsState = MutableStateFlow(emptyList<String>())
    val availableRoomsState: StateFlow<List<String>> = _availableRoomsState

    private val _activeRoomState = MutableStateFlow(String())
    val activeRoomState: StateFlow<String> = _activeRoomState

    private var isConnectedToDrawing : Boolean = false
    private val drawingID: String? = savedStateHandle.get<String>("drawingID")

    private val _exceptionMessage: MutableLiveData<String> by lazy {
        MutableLiveData<String>()
    }
    val exceptionMessage = _exceptionMessage.asFlow()

    private val handler = CoroutineExceptionHandler { _, exception ->
        _exceptionMessage.value = exception.message.toString()
    }

    private val _statusMessage: MutableLiveData<String> by lazy {
        MutableLiveData<String>()
    }
    val statusMessage = _statusMessage.asFlow()

    private var isLeaving = false

    private var isDeleting = false

    init {
        if (drawingID != null) {
            isConnectedToDrawing = true
        }
        viewModelScope.launch(handler) {
            getJoinedRooms()
        }
    }

    fun onEvent(event: ChannelsEvent) {
        when (event) {
            is ChannelsEvent.ChangeRoom -> {
                viewModelScope.launch(handler) {
                    val result = roomUseCases.getAllJoinedRooms()
                    if (!(result.getOrThrow().contains(event.roomName) || (event.roomName.contains("Dessin") && isConnectedToDrawing))) {
                        getJoinedRooms()
                        throw Exception("Le canal ${event.roomName} n'existe plus")
                    }
                    changeActiveRoom(event.roomName)
                }
            }
            is ChannelsEvent.DeleteRoom -> {
                deleteRoom(event.roomName)
            }
            is ChannelsEvent.LeaveRoom -> {
                leaveRoom(event.roomName)
            }
            is ChannelsEvent.CreateRoom -> {
                createRoom(event.roomName)
            }
            is ChannelsEvent.JoinRoom -> {
                joinRoom(event.roomName)
            }
            is ChannelsEvent.RefreshJoinableRooms -> {
                viewModelScope.launch(handler) {
                    getAvailableRooms()
                }
            }
        }
    }

    private fun changeActiveRoom(roomName: String) {
        _activeRoomState.value = roomName
        UnreadMessageTracker.activeRoomState = roomName
        UnreadMessageTracker.clearUnread(roomName)
    }

    private suspend fun getJoinedRooms() {
        val result = roomUseCases.getAllJoinedRooms()

        if (isConnectedToDrawing) {
            val roomList = result.getOrThrow().toMutableList()
            roomList.add(0, "Dessin")
            _joinedRoomsState.value = roomList
        } else {
            _joinedRoomsState.value = result.getOrThrow()
        }
        if (!joinedRoomsState.value.contains(activeRoomState.value)) {
            changeActiveRoom(joinedRoomsState.value[0])
        }
    }

    private suspend fun getAvailableRooms() {
        val result = roomUseCases.getAllAvailableRooms()
        _availableRoomsState.value = result.getOrThrow().filterNot {
            joinedRoomsState.value.contains(it)
        }
    }

    private fun createRoom(roomName: String) {
        viewModelScope.launch(handler) {
            val result = roomUseCases.createRoom(roomName)
            if (result.isSuccess) {
                getJoinedRooms()
                _statusMessage.value = "Vous avez créé le canal $roomName avec succès"
            } else throw result.exceptionOrNull()!!
        }
    }

    private fun deleteRoom(roomName: String) {
        if (isDeleting) return
        isDeleting = true
        viewModelScope.launch(handler) {
            val result = roomUseCases.deleteRoom(roomName)
            if (result.isSuccess) {
                getJoinedRooms()
                _statusMessage.value = "Canal $roomName supprimé avec succès"
            } else {
                isDeleting = false
                throw result.exceptionOrNull()!!
            }
            isDeleting = false
        }
    }

    private fun leaveRoom(roomName: String) {
        if (isLeaving) return
        isLeaving = true
        viewModelScope.launch(handler) {
            val result = roomUseCases.leaveRoom(roomName)
            if (result.isSuccess) {
                getJoinedRooms()
                _statusMessage.value = "Vous avez quitté le canal $roomName"
            } else {
                isLeaving = false
                throw result.exceptionOrNull()!!
            }
            isLeaving = false
        }
    }

    private fun joinRoom(roomName: String) {
        viewModelScope.launch(handler) {
            val result = roomUseCases.joinRoom(roomName)
            if (result.isSuccess) {
                getJoinedRooms()
                _statusMessage.value = "Vous avez rejoint le canal $roomName"
                changeActiveRoom(roomName)
            } else throw result.exceptionOrNull()!!
        }
    }
}
