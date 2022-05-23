import { Injectable } from '@nestjs/common';
import {Socket} from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { badrequestChat, CHAT_EXCEPTION, MESSAGE_FROM_SERVER, unauthorizedChat, USER_CONNECTED, USER_DISCONNECTED } from 'src/const';
import { RoomsService } from 'src/rooms/rooms.service';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { MessageFromClientDto } from './dto/message-from-client.dto';
import { MessageToClientDto } from './dto/message-to-client.dto';
import { Server } from 'socket.io';

@Injectable()
export class ChatService { 
    connectedUser: Map<string, Socket> = new Map<string, Socket>();

    constructor(private authService: AuthService, private roomService: RoomsService) {}

    async handleConnect(token: string, client: Socket): Promise<void> {

        const userdata: UserClientSide | undefined=await this.authService.isUserConnected(token);
        if (userdata === null){
            client.emit(CHAT_EXCEPTION, unauthorizedChat);
            client.disconnect();
            return; 
        }

        const ID = userdata?._id.toString();
        if(this.connectedUser.has(ID)){
            //just to be safe, this sould not happens since on new connexion old account are delete
            this.disconnectUser(ID);
        }
        
        const rooms = await this.roomService.getAllRoomsForUser(ID);
        if(rooms == null){
            client.emit(CHAT_EXCEPTION, badrequestChat);
            client.disconnect();
            return;
        }

        this.connectedUser.set(ID, client);
        client.join(rooms);
        client.to(rooms).emit(USER_CONNECTED, userdata.username);
    }

    async handleDisconnect(token: string, client:Socket): Promise<void> {
        const userdata: UserClientSide | undefined=await this.authService.isUserConnected(token);
        if (!userdata) return;
        const ID = userdata._id.toString();
        
        const rooms = await this.roomService.getAllRoomsForUser(userdata._id);
        if(rooms != null){
            client.to(rooms).emit(USER_DISCONNECTED, userdata.username);
        }
        this.disconnectUser(ID);
    }

    async disconnectUser(id: string){
        const client=this.connectedUser.get(id);
        this.connectedUser.delete(id);
        if(client != null){
            client.emit(CHAT_EXCEPTION, unauthorizedChat);
            client.disconnect();  
        } 
    }

    async sendMessage(client: any, server: Server, incomingMessage: MessageFromClientDto): Promise<void>{
        const userdata = client.info?.userdata;
        const roomAccesibleToClient = client.info?.rooms as string[];
        const date= new Date();
        if(incomingMessage.message == null || incomingMessage.room == null) return;
        if(!roomAccesibleToClient.includes(incomingMessage.room)){
            client.emit(CHAT_EXCEPTION, badrequestChat);
            return;
        }
        if(incomingMessage.message.replace(/[\t\n\r ]+/g, '').length === 0 ) return;
        const messageToSend: MessageToClientDto = {
            message: incomingMessage.message,
            _id: userdata._id,
            username: userdata.username,
            timestamp: date,
            room: incomingMessage.room
        };
        await this.updateAllRoomRorAllUser();
        server.to(incomingMessage.room).emit(MESSAGE_FROM_SERVER, messageToSend);
        await this.roomService.addMessage(incomingMessage.room, messageToSend);
    }

    async updateAllRoomRorAllUser(): Promise<void>{
        for(const user of this.connectedUser){
            const rooms = await this.roomService.getAllRoomsForUser(user[0]);
            await user[1].join(rooms);
        }
    }
}
