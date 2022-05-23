import { Injectable, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { MESSAGE_TO_SERVER} from '../const';
import {Socket} from 'socket.io';
import { ChatGuard } from './guards/chat.guard';
import { ChatService } from './chat.service';
import { MessageFromClientDto } from './dto/message-from-client.dto';
import { BadRequestTransformationFilter } from '../filter/ws-exception-filter';
import { Server } from 'socket.io';



@UseGuards(ChatGuard)
@UseFilters(BadRequestTransformationFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({cors: true, path: '/chat' })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private chatService: ChatService) { }

    async handleConnection(client: Socket): Promise<void> {
        const token=client.handshake?.query?.Authorization;
        this.chatService.handleConnect(token as string, client);
    }

    async handleDisconnect(client: Socket): Promise<void> {
        const token=client.handshake?.query?.Authorization;
        this.chatService.handleDisconnect(token as string, client);       
    }
    
    
    @SubscribeMessage(MESSAGE_TO_SERVER)
    async onChat(client: Socket, incomingMessage: MessageFromClientDto): Promise<void> {
        await this.chatService.sendMessage(client, this.server, incomingMessage);
    }
}
