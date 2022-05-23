package com.client_leger.colorimage.drawing.converter

import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.data.data_source.MessageServer
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.URISyntaxException

object DrawingSocketHandler {

    private lateinit var drawingSocket: Socket
    private var isConnected = false

    @Synchronized
    fun setSocket(drawingID: String, password: String?) {
        try {
            drawingSocket = if (password == null){
                IO.socket("https://backendpi3.fibiess.com", IO.Options.builder().setPath("/drawing")
                    .setQuery("Authorization=${SocketHandler.getToken()}&drawingID=${drawingID}")
                    .build()
                )
            } else{
                IO.socket("https://backendpi3.fibiess.com", IO.Options.builder().setPath("/drawing")
                    .setQuery("Authorization=${SocketHandler.getToken()}&drawingID=${drawingID}&password=${password}")
                    .build()
                )
            }
        } catch (e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getSocket(): Socket {
        return drawingSocket
    }

    fun isConnected() = isConnected

    fun connect() {
        isConnected = true
        drawingSocket.connect()
        CoroutineScope(Dispatchers.IO).launch { MessageServer.startDrawingMessageFlow() }
        UnreadMessageTracker.startUnreadDrawingMonitoring()
    }

    fun disconnect() {
        isConnected = false
        UnreadMessageTracker.stopUnreadDrawingMonitoring()
        drawingSocket.disconnect()
        drawingSocket.close()
    }
}
