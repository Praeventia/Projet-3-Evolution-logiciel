package com.client_leger.colorimage.Chat

import com.client_leger.colorimage.Model.User
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import java.net.URISyntaxException

object SocketHandler {

    lateinit var mSocket: Socket
    private lateinit var key: String

    @Synchronized
    private fun setSocket() {
        try {
            mSocket = IO.socket(
                "https://backendpi3.fibiess.com",
                IO.Options.builder().setPath("/chat").setQuery("Authorization=$key").build()
            )
        } catch (e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getSocket(): Socket {
        return mSocket
    }

    @Synchronized
    fun establishConnection() {
        User.setUserAuthenticationStatus(true)
        mSocket.connect()
    }

    @Synchronized
    fun closeConnection() {
        User.setUserAuthenticationStatus(false)
        key = ""
        mSocket.disconnect()
    }

    fun getEmitterListener(event: String, listener: Emitter.Listener): Emitter? {
        return getSocket().on(event, listener)
    }

    fun setToken(token: String) {
        println(token)
        key = token
        setSocket()
    }

    fun getToken(): String {
        return key
    }

}
