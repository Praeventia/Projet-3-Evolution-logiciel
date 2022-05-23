import { Injectable } from '@nestjs/common';
import { AlbumsService } from 'src/albums/albums.service';
import { ChatService } from 'src/chat/chat.service';
import { MAIN_ALBUM, MAIN_ROOM } from 'src/const';
import { DrawingRealTimeService } from 'src/drawings/drawings-real-time.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ConnexionService {
    constructor(
        private readonly albumService: AlbumsService,
        private readonly chatService: ChatService,
        private readonly roomsService: RoomsService,
        private readonly drawingRealTimeService: DrawingRealTimeService,
        private readonly usersService: UsersService
    ) {}

    async onCreateProfil(userID: string): Promise<void>{
        this.roomsService.addUserToRoom(MAIN_ROOM, userID);
        const mainAlbum = await this.albumService.findAlbumByAlbumName(MAIN_ALBUM);
        this.albumService.allowUserToJoinAlbum(mainAlbum._id.toString(), userID);
    }

    async onLogin(userID: string): Promise<void>{
        this.chatService.disconnectUser(userID);
        this.drawingRealTimeService.disconnectUser(userID);
    }

    async onDisconnect(userID: string): Promise<void>{
        this.chatService.disconnectUser(userID);
        this.drawingRealTimeService.disconnectUser(userID);
        this.usersService.updateUserDisconnectTime(userID);
    }
}
