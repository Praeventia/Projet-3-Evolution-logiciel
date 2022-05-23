import { Injectable, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage, WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BadRequestTransformationFilter } from 'src/filter/ws-exception-filter';
import { CHANGE_COMMAND_TO_SERVER, DELETE_COMMAND_TO_SERVER, DRAWING_TO_SERVER, MESSAGE_TO_SERVER_IN_DRAWING, SELECT_COMMAND_TO_SERVER, SWITCH_COMMAND_TO_SERVER, UNSELECT_COMMAND_TO_SERVER} from '../const';
import { DrawingRealTimeService } from './drawings-real-time.service';
import { ChangeCommandFromClientDto } from './dto/real-time/change-command-from-client.dto';
import { ChangeCommandToClientDto } from './dto/real-time/change-command-to-client.dto';
import { CommandFromClientDto } from './dto/real-time/command-from-client.dto';
import { CommandToClientDto } from './dto/real-time/command-to-client.dto';
import { DeleteCommandFromClientDto } from './dto/real-time/delete-command-drawing-from-client.dto';
import { DeleteCommandToClientDto } from './dto/real-time/delete-command-drawing-to-client.dto';

import { DrawingGuard } from './guards/drawing.guard';
import { MessageFromClientDrawingDto } from './dto/real-time/message-from-client-drawing.dto';
import { SelectCommandFromClientDto } from './dto/real-time/select-command-drawing-from-client.dto';
import { SelectCommandToClientDto } from './dto/real-time/select-command-drawing-to-client.dto';
import { SwitchCommandFromClientDto } from './dto/real-time/switch-command-drawing-from-client.dto';
import { SwitchCommandToClient } from './dto/real-time/switch-command-drawing-to-client.dto';
import { UnselectCommandFromClientDto } from './dto/real-time/unselect-command-drawing-from-client.dto';
import { UnselectCommandToClientDto } from './dto/real-time/unselect-command-drawing-to-client.dto';




//inspire from https://www.joshmorony.com/creating-a-simple-live-chat-server-with-nestjs-websockets/

@UseFilters(BadRequestTransformationFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({cors: true, path: '/drawing' })
@UseGuards(DrawingGuard)
@Injectable()
export class DrawingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server;

    constructor(private readonly drawingsRealTimeService: DrawingRealTimeService) {}

    async handleConnection(client: Socket): Promise<void> {
        const tokenname=client.handshake?.query?.Authorization as string;
        const drawingID=client.handshake?.query?.drawingID as string;
        const password=client.handshake?.query?.password as string;
        this.drawingsRealTimeService.handleConnect(drawingID, tokenname, client, password);
    }

    async handleDisconnect(client: Socket): Promise<void> {
        const tokenname=client.handshake?.query?.Authorization as string;
        this.drawingsRealTimeService.handleDisconnect(tokenname);
    }

    @SubscribeMessage(DRAWING_TO_SERVER)
    async onDrawing(client: Socket, command: CommandFromClientDto): Promise<CommandToClientDto> {
        const commandToClient = await this.drawingsRealTimeService.handleCommand(client, command);
        return commandToClient;
    }

    @SubscribeMessage(SWITCH_COMMAND_TO_SERVER)
    async onSwitch(client: Socket, command:SwitchCommandFromClientDto): Promise<SwitchCommandToClient>{
        const commandToClient = await this.drawingsRealTimeService.handleSwitch(client, command);
        return commandToClient;
    }

    @SubscribeMessage(SELECT_COMMAND_TO_SERVER)
    async onSelect(client:Socket, command:SelectCommandFromClientDto): Promise<SelectCommandToClientDto> {
        const commandToClient = await this.drawingsRealTimeService.handleSelect(client, command);
        return commandToClient;
    }

    @SubscribeMessage(UNSELECT_COMMAND_TO_SERVER)
    async onUnselect(client:Socket, command:UnselectCommandFromClientDto): Promise<UnselectCommandToClientDto> {
        const commandToClient = await this.drawingsRealTimeService.handleUnselect(client, command);
        return commandToClient;
    }

    @SubscribeMessage(CHANGE_COMMAND_TO_SERVER)
    async onChangeCommand(client:Socket, command:ChangeCommandFromClientDto): Promise<ChangeCommandToClientDto>{
        const commandToClient = await this.drawingsRealTimeService.handleChangeSelectedAttribute(client, command);
        return commandToClient;
    }

    @SubscribeMessage(DELETE_COMMAND_TO_SERVER)
    async onDeleteCommand(client:Socket, command:DeleteCommandFromClientDto): Promise<DeleteCommandToClientDto>{
        const commandToClient = await this.drawingsRealTimeService.handleDeleteCommand(client, command);
        return commandToClient;
    }

    @SubscribeMessage(MESSAGE_TO_SERVER_IN_DRAWING)
    async onChat(client: Socket, incomingMessage: MessageFromClientDrawingDto): Promise<void> {
        await this.drawingsRealTimeService.sendMessage(client, this.server, incomingMessage);
    }


    
}

