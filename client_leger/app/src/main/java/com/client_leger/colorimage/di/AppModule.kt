package com.e108.colorimage.di

import com.client_leger.colorimage.Chat.data.repository.MessageRepositoryImpl
import com.client_leger.colorimage.Chat.data.repository.RoomRepositoryImpl
import com.client_leger.colorimage.Chat.domain.repository.MessageRepository
import com.client_leger.colorimage.Chat.domain.repository.RoomRepository
import com.client_leger.colorimage.Chat.domain.use_case.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import com.client_leger.colorimage.Chat.domain.use_case.RoomUseCases

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideMessageRepository(): MessageRepository {
        return MessageRepositoryImpl()
    }

    @Provides
    @Singleton
    fun provideMessageUseCases(repository: MessageRepository): MessageUseCases {
        return MessageUseCases(
            getMessageHistory = GetMessages(repository),
            sendMessage = SendMessage(repository),
            receiveMessage = ReceiveMessage(repository),
            receiveAllMessage = ReceiveAllMessage(repository)
        )
    }

    @Provides
    @Singleton
    fun provideRoomRepository(): RoomRepository {
        return RoomRepositoryImpl()
    }

    @Provides
    @Singleton
    fun provideRoomUseCases(repository: RoomRepository): RoomUseCases {
        return RoomUseCases(
            createRoom = CreateRoom(repository),
            deleteRoom = DeleteRoom(repository),
            getAllAvailableRooms = GetAllAvailableRooms(repository),
            getAllJoinedRooms = GetAllJoinedRooms(repository),
            joinRoom = JoinRoom(repository),
            leaveRoom = LeaveRoom(repository)
        )
    }
}
