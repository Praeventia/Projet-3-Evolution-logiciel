import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { badrequestDrawing, CHANGE_COMMAND_FROM_SERVER, DELETE_COMMAND_FROM_SERVER, DRAWING_EXCEPTION, DRAWING_FROM_SERVER, MESSAGE_FROM_SERVER_IN_DRAWING, SELECT_COMMAND_FROM_SERVER, SWITCH_COMMAND_FROM_SERVER, unauthorizedDrawing, UNSELECT_COMMAND_FROM_SERVER} from 'src/const';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { DrawingsService } from './drawings.service';
import { ChangeCommandFromClientDto } from './dto/real-time/change-command-from-client.dto';
import { ChangeCommandToClientDto } from './dto/real-time/change-command-to-client.dto';
import { CommandFromClientDto } from './dto/real-time/command-from-client.dto';

import { Command, Drawing } from './schema/drawing.schema';
import { Server } from 'socket.io';
import { Vec2 } from './dto/commands/vec2';
import { UsersService } from 'src/users/users.service';
import { ToolType } from './dto/commands/tool-type';
import { DeleteCommandFromClientDto } from './dto/real-time/delete-command-drawing-from-client.dto';
import { DeleteCommandToClientDto } from './dto/real-time/delete-command-drawing-to-client.dto';
import { SelectCommand } from './class/two-way-map-select-command';

import { CommandToClientDto } from './dto/real-time/command-to-client.dto';
import { MessageFromClientDrawingDto } from './dto/real-time/message-from-client-drawing.dto';
import { MessageToClientDrawingDto } from './dto/real-time/message-to-client-drawing.dto';
import { SelectCommandFromClientDto } from './dto/real-time/select-command-drawing-from-client.dto';
import { SelectCommandToClientDto } from './dto/real-time/select-command-drawing-to-client.dto';
import { SwitchCommandFromClientDto } from './dto/real-time/switch-command-drawing-from-client.dto';
import { SwitchCommandToClient } from './dto/real-time/switch-command-drawing-to-client.dto';
import { UnselectCommandFromClientDto } from './dto/real-time/unselect-command-drawing-from-client.dto';
import { UnselectCommandToClientDto } from './dto/real-time/unselect-command-drawing-to-client.dto';
import { DrawPencilData } from './dto/commands/data/draw-pencil-data';
import { ConnectClientByDrawing } from './class/connect-client-by-drawing';


const inPositiveRange=(maxNumber:number, numberToEvaluate: number):boolean=>{
    if(numberToEvaluate<0 || numberToEvaluate>=maxNumber) return false;
    return true;
};

const pathDistance=(pathData:Vec2[]): number =>{
    let distance = 0;
    if(pathData == null) return 0;
    for(let i=0; i<pathData.length-1; i++){
        const vectorBetween: Vec2 = {x: pathData[i+1].x - pathData[i].x , y: pathData[i+1].y - pathData[i].y};
        distance += Math.sqrt((vectorBetween.x**2) + (vectorBetween.y**2));
    }
    return Math.floor(distance);
    
};


@Injectable()
export class DrawingRealTimeService {
    connectedUserByIDToSocket: Map<string, Socket> = new Map<string, Socket>();
    connectedUserByDrawing: ConnectClientByDrawing = new ConnectClientByDrawing();
    selectedCommandByUser: SelectCommand = new SelectCommand();
    beginningOfEditionTime: Map<string, number> = new Map<string, number>(); 

    constructor(private readonly authService: AuthService, private drawingsService: DrawingsService, private userService: UsersService) { }

    async handleConnect(drawingID: string, tokenname: string, client:any, password?: string): Promise<void>{
        const userdata: UserClientSide | undefined=await this.authService.isUserConnected(tokenname);
        if (userdata == null){
            //le user nexiste pas
            try{
                client.emit(DRAWING_EXCEPTION, unauthorizedDrawing);
                client.disconnect();
            }catch(error: any){
                throw new WsException('Client is not a socket');
            }finally{
                return;
            } 
        }
        const ID = userdata._id.toString();
        if(this.connectedUserByIDToSocket.has(ID)){
            //le user etait deja connecte, je le deconnecte
            await this.disconnectUser(ID);
        }
        const access: boolean = await this.drawingsService.authorizeToSendDrawingCommand(drawingID, tokenname, password);
        if(!access){
            //le user na pas le droit denvoyer de dessin
            try{
                client.emit(DRAWING_EXCEPTION, badrequestDrawing);
                client.disconnect();
                await this.disconnectUser(ID);
            }catch(error: any){
                throw new WsException('Client is not a socket');
            }finally{
                return;
            }
        }
        
        //le user a le droit denvoyer des dessins
        this.connectedUserByIDToSocket.set(ID, client);

        this.connectedUserByDrawing.addClientToDrawing(drawingID, ID);
        //updating connexion time
        this.beginningOfEditionTime.set(ID, Date.now()/1000);
        client.join(drawingID);
    }

    async handleDisconnect(tokenname: string): Promise<void>{
        if(tokenname == null) return;
        const userdata: UserClientSide | undefined=await this.authService.isUserConnected(tokenname);
        if(userdata == null){
            return;
        }
        const ID = userdata._id.toString();
        await this.disconnectUser(ID);
    }

    async disconnectUser(id: string){
        const client=this.connectedUserByIDToSocket.get(id);
        if(client != null){
            //deconnecter le client
            client?.emit(DRAWING_EXCEPTION, unauthorizedDrawing);
            client?.disconnect();
            this.connectedUserByIDToSocket.delete(id);
            
        }

        //deconnecter le client de tout les drawings
        this.connectedUserByDrawing.removeUserInDrawing(id);
        


        //retirer les commandes selectionner par l'utilisateur
        this.selectedCommandByUser.unselectCommandSelectedByUser(id);

        //update le connexion time to drawing
        if(this.beginningOfEditionTime.has(id)){
            const beginningTime = this.beginningOfEditionTime.get(id);
            const editionTime = Math.floor((Date.now()/1000) - beginningTime);
            await this.drawingsService.updateUserCollaborationTime(id, editionTime);
            this.beginningOfEditionTime.delete(id);
        }

    }

    async getConnectedUserInDrawing(drawingID: string): Promise<string[]>{
        const result = this.connectedUserByDrawing.getConnectedUserInDrawing(drawingID);
        return result;
    }

    async getSelectedCommandInDrawing(drawingID: string): Promise<SelectCommandToClientDto[]>{
        const answer: SelectCommandToClientDto[] = [];
        for(const commandID of this.selectedCommandByUser.commandIDToUserID){
            const command = await this.drawingsService.findCommandById(commandID[0]);
            if(command != null){
                if(command.drawing._id.toString() === drawingID){
                    answer.push({commandID: command._id.toString(), userID: commandID[1].toString()});
                }
            }
        }
        return answer;
    }

    async handleCommand(client: any, commandFromClient:CommandFromClientDto): Promise<CommandToClientDto>{
        const commandFromDatabase: Command = await this.drawingsService.addCommand(client.info.drawingID, commandFromClient, client.info.userdata._id);
        const commandToClient: CommandToClientDto = {
            timestamp: commandFromDatabase.timestamp,
            owner: commandFromDatabase.owner._id.toString(),
            drawingID: commandFromDatabase.drawing._id.toString(),
            commandNumber: commandFromDatabase.commandNumber,
            command: commandFromDatabase.command,
            _id:commandFromDatabase._id.toString()
        };
        client.to(client.info.drawingID).emit(DRAWING_FROM_SERVER, commandToClient);
        if(commandFromClient.tool === ToolType.pencil){
            const drawPencil: DrawPencilData = commandFromClient.commandData as DrawPencilData;
            const distance = pathDistance(drawPencil.pathData);
            this.userService.incrementUserPixelCross(client.info.userdata._id, distance);
            this.userService.incrementUserLineCount(client.info.userdata._id);
        }else if(commandFromClient.tool === ToolType.ellipse || commandFromClient.tool === ToolType.rectangle){
            this.userService.incrementUserShapeCount(client.info.userdata._id);
        }
        this.drawingsService.updateDrawingLastUpdateTime(client.info.drawingID);
        return commandToClient;
    }

    async handleSwitch(client: any, switchCommandFromClient: SwitchCommandFromClientDto): Promise<SwitchCommandToClient>{
        const drawing: Drawing = await this.drawingsService.findDrawingByID(client.info.drawingID);
        if(drawing == null) throw new HttpException('Cette commande ne peut pas être échanger', HttpStatus.CONFLICT);
        const size = drawing.numberOfCommand;
        if(!inPositiveRange(size, switchCommandFromClient.commandPosition))
            throw new HttpException('Cette commande ne peut pas être échanger', HttpStatus.CONFLICT); 
        if(!inPositiveRange(size, switchCommandFromClient.newPosition))
            throw new HttpException('Cette commande ne peut pas être échanger', HttpStatus.CONFLICT);
        if(switchCommandFromClient.commandPosition === switchCommandFromClient.newPosition)
            throw new HttpException('Cette commande ne peut pas être échanger', HttpStatus.CONFLICT);

        
        try{
            const commandToSwitch = await this.drawingsService.commandModel.findOne(
                {commandNumber: switchCommandFromClient.commandPosition, drawing: drawing._id},
            );  
            if(switchCommandFromClient.commandPosition>switchCommandFromClient.newPosition){
                await this.drawingsService.commandModel.updateMany(
                    {drawing:drawing._id, commandNumber:{$gte:switchCommandFromClient.newPosition, $lt:switchCommandFromClient.commandPosition}},
                    {$inc: {commandNumber: 1}}
                );
            }else{
                await this.drawingsService.commandModel.updateMany(
                    {drawing:drawing._id, commandNumber:{$gt:switchCommandFromClient.commandPosition, $lte:switchCommandFromClient.newPosition}},
                    {$inc: {commandNumber: -1}}
                );
            }
            await this.drawingsService.commandModel.updateOne(
                {_id: commandToSwitch._id},
                {commandNumber: switchCommandFromClient.newPosition}
            ); 
        }catch(error:any){
            throw new HttpException('Cette commande ne peut pas être échanger', HttpStatus.CONFLICT);
        }
        client.to(client.info.drawingID).emit(SWITCH_COMMAND_FROM_SERVER, switchCommandFromClient);
        this.drawingsService.updateDrawingLastUpdateTime(client.info.drawingID);
        return switchCommandFromClient;
        
    }

    async handleSelect(client: any, selectCommand: SelectCommandFromClientDto): Promise<SelectCommandToClientDto>{
        const command = await this.drawingsService.findCommandById(selectCommand.commandID);
        if(command == null) throw new HttpException('Cette commande n\'existe pas', HttpStatus.CONFLICT);
        this.selectedCommandByUser.selectCommand(client.info.userdata._id.toString(), command._id.toString());
        const commandToSend: SelectCommandToClientDto = {commandID: command._id.toString(), userID: client.info.userdata._id.toString()};
        client.to(client.info.drawingID).emit(SELECT_COMMAND_FROM_SERVER, commandToSend);
        return commandToSend;
    }

    async handleUnselect(client: any, unselectCommand: UnselectCommandFromClientDto): Promise<UnselectCommandToClientDto>{
        const command = await this.drawingsService.findCommandById(unselectCommand.commandID);
        if(command == null) throw new HttpException('Cette commande n\'existe pas', HttpStatus.CONFLICT);
        const access = this.selectedCommandByUser.doesUserSelectCommand(client.info.userdata._id.toString(), unselectCommand.commandID.toString());
        if(!access) throw new HttpException('Cette commande n\'est pas sélectionné par l\'utilisateur', HttpStatus.CONFLICT);
        this.selectedCommandByUser.unselectCommand(unselectCommand.commandID);
        const commandToSend: UnselectCommandToClientDto = {commandID: command._id.toString()};
        client.to(client.info.drawingID).emit(UNSELECT_COMMAND_FROM_SERVER, commandToSend);
        return commandToSend;
    }

    async handleChangeSelectedAttribute(client: any, changeCommand: ChangeCommandFromClientDto): Promise<ChangeCommandToClientDto>{
        const access = this.selectedCommandByUser.doesUserSelectCommand(client.info.userdata._id.toString(), changeCommand.commandID.toString());
        if(!access) throw new HttpException('Vous ne pouvez pas changer les attributs de la commande', HttpStatus.CONFLICT);
        try{
            const result = await this.drawingsService.commandModel.updateOne({_id: changeCommand.commandID},
                {
                    command: changeCommand.commandFromClient,
                    timestamp: new Date()
                }  
            );
            if(result.modifiedCount<1) throw new HttpException('Votre commande n\'a pas été changé', HttpStatus.CONFLICT);
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const commandFromDatabase = await this.drawingsService.findCommandById(changeCommand.commandID);
        const commandToClient: CommandToClientDto = {
            timestamp: commandFromDatabase.timestamp,
            owner: commandFromDatabase.owner._id.toString(),
            drawingID: commandFromDatabase.drawing._id.toString(),
            commandNumber: commandFromDatabase.commandNumber,
            command: commandFromDatabase.command,
            _id:commandFromDatabase._id.toString()
        };
        const commandToSend: ChangeCommandToClientDto ={
            commandID: changeCommand.commandID,
            commandToClient: commandToClient
        };
        client.to(client.info.drawingID).emit(CHANGE_COMMAND_FROM_SERVER, commandToSend);
        this.drawingsService.updateDrawingLastUpdateTime(client.info.drawingID);
        return commandToSend;
    }

    async handleDeleteCommand(client: any, deleteCommand: DeleteCommandFromClientDto): Promise<DeleteCommandToClientDto>{
        const access = this.selectedCommandByUser.doesUserSelectCommand(client.info.userdata._id.toString(), deleteCommand.commandID.toString());
        if(!access) throw new HttpException('Vous ne pouvez pas changer les attributs de la commande', HttpStatus.CONFLICT);
        try{
            const command: Command = await this.drawingsService.commandModel.findOne({_id: deleteCommand.commandID});
            if(command == null) throw new HttpException('Votre commande n\'a pas été changé', HttpStatus.CONFLICT);
            //delete command
            const result = await this.drawingsService.commandModel.deleteOne({_id: deleteCommand.commandID});
            if(result.deletedCount<1) throw new HttpException('Votre commande n\'a pas été changé', HttpStatus.CONFLICT);
            //dec all command above this command
            await this.drawingsService.commandModel.updateMany({drawing:command.drawing._id.toString(), commandNumber:{$gt:command.commandNumber}},
                {$inc: {commandNumber: -1}}
            );
            await this.drawingsService.drawingModel.updateOne({_id:command.drawing._id.toString()}, {$inc: {numberOfCommand:-1}});
            
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const commandToClient: DeleteCommandToClientDto = {
            userID: client.info.userdata._id.toString(),
            commandID: deleteCommand.commandID.toString(),  
        };
        this.selectedCommandByUser.unselectCommand(deleteCommand.commandID.toString());
        client.to(client.info.drawingID).emit(DELETE_COMMAND_FROM_SERVER, commandToClient);
        this.drawingsService.updateDrawingLastUpdateTime(client.info.drawingID);
        return commandToClient;
    }

    async sendMessage(client: any, server: Server, incomingMessage: MessageFromClientDrawingDto): Promise<void>{
        const userdata = client.info?.userdata;
        const date= new Date();
        if(incomingMessage.message == null) return;
        if(incomingMessage.message.replace(/[\t\n\r ]+/g, '').length === 0 ) return;
        const messageToSend: MessageToClientDrawingDto = {
            message: incomingMessage.message,
            _id: userdata._id,
            username: userdata.username,
            timestamp: date,
        };
        server.to(client.info.drawingID).emit(MESSAGE_FROM_SERVER_IN_DRAWING, messageToSend);
        await this.drawingsService.addMessage(client.info.drawingID, messageToSend);
    }

}
