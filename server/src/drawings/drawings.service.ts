import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types} from 'mongoose';
import { Album } from 'src/albums/schema/album.schema';
import { AuthService } from 'src/auth/auth.service';
import { ConcoursEntry, ConcoursEntryDocument } from 'src/concours/schema/concours-entry.schema';
import { DEFAULT_DRAWING_PICTURE, DEFAULT_GIF_PICTURE, SALT_VALUE } from 'src/const';
import { RoomsService } from 'src/rooms/rooms.service';
import { Message } from 'src/rooms/schema/rooms.schema';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { DrawingClientSide } from './dto/drawing-client-side.dto';
import { CommandFromClientDto } from './dto/real-time/command-from-client.dto';
import { CommandToClientDto } from './dto/real-time/command-to-client.dto';
import { MessageToClientDrawingDto } from './dto/real-time/message-to-client-drawing.dto';
import { RecentDrawingEditedToClient } from './dto/recent-drawing-edited.dto';
import { Command, CommandDocument, Drawing, DrawingDocument } from './schema/drawing.schema';


@Injectable()
export class DrawingsService {

    constructor(
        @InjectModel(Drawing.name) public drawingModel: Model <DrawingDocument>,
        @InjectModel(Command.name) public commandModel: Model <CommandDocument>,
        @InjectModel(ConcoursEntry.name) public concoursEntryModel: Model <ConcoursEntryDocument>,
        private readonly userService: UsersService,
        private readonly authService: AuthService,
        private readonly roomService: RoomsService) { }

    async userHasAccessToDrawing(userID: string, drawingID: string): Promise<boolean>{
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) return false;
        const result = await this.userService.userHasAccessToAlbum(userID, drawing.album._id.toString());
        return result;
    }

    async userIsOwnerOfDrawing(userID: string, drawingID: string): Promise<boolean>{
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) return false;
        if(drawing.owner._id.toString() === userID) return true;
        return false;
    }

    async allDrawingOwnByUser(userID: string): Promise<string[]>{
        try{
            const result = await this.drawingModel.find({owner: userID}).sort({creationDate:1});
            if(result == null) return [];
            const drawingIdtoSend: string [] = result.map((drawing: Drawing) => drawing._id.toString());
            return drawingIdtoSend;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async userCanSeeDrawing(userID: string, drawingID: string): Promise<boolean>{
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) return false;
        const result = await this.userService.userHasAccessToAlbum(userID, drawing.album._id.toString());
        const access = drawing.isExposed || result;
        return access;
    }
   
    async findDrawingByDrawingName(drawingName: string): Promise<Drawing | undefined> {
        try{
            const drawing = await this.drawingModel.findOne({drawingName:drawingName}).exec();
            return drawing;
        }catch(error:any){
            throw new HttpException('Le dessin n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async findDrawingByID(id: string): Promise<Drawing | undefined> {
        try{
            const drawing = await this.drawingModel.findById(id);
            return drawing;
        }catch(error:any){
            throw new HttpException('Le dessin n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async findCommandById(commandID: string): Promise<Command> {
        try{
            const command = await this.commandModel.findById(commandID);
            return command;
        }catch(error:any){
            throw new HttpException('Le dessin n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async createDrawing(drawingName: string, userID:string, isPublic:boolean, isPasswordProtected: boolean, album: Album, password: string | undefined): Promise<Drawing> {
        const drawing = await this.findDrawingByDrawingName(drawingName);
        if(drawing) throw new HttpException('Ce dessin existe déjà', HttpStatus.CONFLICT);
        const owner = await this.userService.findOneByID(userID);
        if(owner == null) throw new HttpException('Le propriétaire n\'existe pas', HttpStatus.CONFLICT); 

        if(isPasswordProtected){
            if(password == null) throw new HttpException('Le mot de passe n\'est pas spécifié', HttpStatus.CONFLICT);
            password=await bcrypt.hash(password, SALT_VALUE);
        }else{
            if(password != null) throw new HttpException('Le mot de passe ne devrait pas être spécifié', HttpStatus.CONFLICT);
        }

        const creationDate = new Date();
        
        const newDrawing: Drawing = {
            drawingName: drawingName,
            drawingPath: DEFAULT_DRAWING_PICTURE,
            gifPath: DEFAULT_GIF_PICTURE,
            isPublic: isPublic, 
            isPasswordProtected: isPasswordProtected,
            isExposed: false,
            password: password,
            owner: owner,
            album: album,
            messages: [],
            creationDate: creationDate,
            lastUpdate: creationDate,
            lastGifUpdate: creationDate,
            lastImageUpdate: creationDate,
            commands: [],
            numberOfCommand: 0
        };
        try{
            const result: Drawing= await this.drawingModel.create(newDrawing);
            if (result == null) throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            await this.userService.addUserToContributeDrawing(userID, result);
            return result;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllCommandsInDrawing(drawingID: string): Promise<CommandToClientDto[]> {
        const drawing: Drawing = await this.drawingModel.findById(drawingID).populate(
            { 
                path: 'commands',
                options:{ sort: { 'commandNumber': 1 } },
            }
        ).exec();
        if(drawing == null) return [];
        const commandsToClient: CommandToClientDto[] = drawing.commands.map((commandFromDatabase:Command): CommandToClientDto => {
            return {
                timestamp: commandFromDatabase.timestamp,
                owner: commandFromDatabase.owner._id.toString(),
                drawingID: commandFromDatabase.drawing._id.toString(),
                commandNumber: commandFromDatabase.commandNumber,
                command: commandFromDatabase.command,
                _id : commandFromDatabase._id.toString()
            };
        });
        return commandsToClient;
    }

    async allCommandToClient(clientID: string): Promise<CommandToClientDto[]>{
        try{
            const command: Command[] = await this.commandModel.find({owner: clientID}).sort({timestamp:-1});
            if(command == null) return [];
            const commandToClient: CommandToClientDto[] = command.map((commandFromDatabase:Command): CommandToClientDto => {
                return {
                    timestamp: commandFromDatabase.timestamp,
                    owner: commandFromDatabase.owner._id.toString(),
                    drawingID: commandFromDatabase.drawing._id.toString(),
                    commandNumber: commandFromDatabase.commandNumber,
                    command: commandFromDatabase.command,
                    _id : commandFromDatabase._id.toString()
                };
            });
            return commandToClient;

        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async recentDrawingEdited(clientID: string): Promise<RecentDrawingEditedToClient[]>{
        try{
            const results = await this.commandModel.aggregate([
                { 
                    $match : {
                        owner : new Types.ObjectId(clientID)
                    }
                },
                {$group: {_id:'$drawing', lastEditionDate: {$max: '$timestamp'}}},
                {$sort:{lastEditionDate:-1}},
            ]);
            const filteredResult = results.filter(async (recentDrawingEditedToClient : RecentDrawingEditedToClient)=>{
                const access = await this.userHasAccessToDrawing(clientID, recentDrawingEditedToClient._id.toString());
                return access;
            });
            return filteredResult;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

   
    async getAllContributedDrawingForUser(userID: string): Promise<string[]> {
        const roomsUsers= await this.userService.getAllContributedDrawingForUser(userID);
        if(roomsUsers == null) return [];
        return roomsUsers;
    }

    async getAllContributedDrawingForUser2(userID: string): Promise<DrawingClientSide[]> {
        const roomsUsers= await this.userService.getAllContributedDrawingForUser2(userID);
        if(roomsUsers == null) return [];
        return roomsUsers;
    }

    async allowUserToContributeDrawing(drawingID: string, userID: string, password?: string): Promise<boolean> {
        const drawing = await this.findDrawingByID(drawingID);
        const access = await this.userHasAccessToDrawing(userID, drawingID);
        if(!access) return false;
        if(drawing == null) return false;
        const owner = await this.userIsOwnerOfDrawing(userID, drawingID);
        if(owner) return true;
        if(drawing.isPasswordProtected){
            if(password == null) return false;
            const isMatch=await bcrypt.compare(password, drawing.password);
            if (!isMatch) return false;
        }
        await this.userService.addUserToContributeDrawing(userID, drawing);
        return true;
        
    }

    async isPasswordOk(drawingID: string, userID:string, password:string): Promise<boolean>{
        const drawing = await this.findDrawingByID(drawingID);
        const access = await this.userHasAccessToDrawing(userID, drawingID);
        if(!access) throw new HttpException('L\'utilisateur n\'a pas accès au dessin', HttpStatus.CONFLICT);
        if(drawing == null) return false;
        const owner = await this.userIsOwnerOfDrawing(userID, drawingID);
        if(owner) throw new HttpException('Le propriétaire ne doit pas demander le mot de passe', HttpStatus.CONFLICT);
        if(drawing.isPasswordProtected){
            const isMatch=await bcrypt.compare(password, drawing.password);
            if (isMatch) return true;
            return false;
        }else{
            throw new HttpException('Le dessin n\'est pas protégé par un mot de passe', HttpStatus.CONFLICT);
        }

    }

    async deleteDrawing(drawingID: string): Promise<boolean> {
        try{
            const drawing = await this.findDrawingByID(drawingID);
            if(drawing == null) return false;
            const resultDelete = await this.drawingModel.deleteOne({_id: drawingID});
            if(resultDelete.deletedCount < 1) return false;
            await this.userService.removeDrawingToEveryUser(drawing);
            await this.concoursEntryModel.deleteMany({drawing: drawingID});
            await this.commandModel.deleteMany({drawing: drawingID});
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async deleteDrawingByUser(drawingID: string, userID:string): Promise<boolean> {
        const userAccess = await this.userIsOwnerOfDrawing(userID, drawingID);
        if(!userAccess) throw new HttpException('Seulement le propriétaire peut supprimer un dessin', HttpStatus.INTERNAL_SERVER_ERROR);
        try{
            const result = await this.deleteDrawing(drawingID);
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeDrawingName(drawingID: string, userID:string, newDrawingName: string): Promise<boolean>{
        const userAccess = await this.userIsOwnerOfDrawing(userID, drawingID);
        if(!userAccess) throw new HttpException('Seulement le propriétaire peut changer le nom du dessin', HttpStatus.CONFLICT);
        const drawing = await this.findDrawingByDrawingName(newDrawingName);
        if(drawing != null) throw new HttpException('Le nom de ce dessin existe déjà', HttpStatus.CONFLICT);
        try{
            const result=await this.drawingModel.updateOne({_id:drawingID}, {drawingName: newDrawingName});
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeDrawingPassword(drawingID: string, userID:string, newPassword: string): Promise<boolean>{
        const userAccess = await this.userIsOwnerOfDrawing(userID, drawingID);
        if(!userAccess) throw new HttpException('Seulement le propriétaire peut changer le mot de passe', HttpStatus.CONFLICT);
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) throw new HttpException('Le dessin n\'existe pas', HttpStatus.CONFLICT);
        if(!drawing.isPasswordProtected) throw new HttpException('Le dessin n\'est pas protégé', HttpStatus.CONFLICT);
        try{
            const newHashedPassword=await bcrypt.hash(newPassword, SALT_VALUE);
            const result=await this.drawingModel.updateOne({_id:drawingID}, {password: newHashedPassword});
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeProtectionDrawing(drawingID: string, userID: string, newPassword?:string): Promise<boolean>{
        const userAccess = await this.userIsOwnerOfDrawing(userID, drawingID);
        if(!userAccess) throw new HttpException('Seulement le propriétaire peut changer le niveau de protection', HttpStatus.CONFLICT);
        const drawing = await this.findDrawingByID(drawingID);
        if(!drawing.isPublic) throw new HttpException('Impossible de protéger un dessin qui est dans un album privé', HttpStatus.CONFLICT);
        
        if(drawing.isPasswordProtected){
            if(newPassword != null) throw new HttpException('Vous ne devez pas spécifier un mot de passe', HttpStatus.CONFLICT);
            try{
                const result = await this.drawingModel.updateOne({_id:drawingID}, {isPasswordProtected:false, password:null});
                if(result.modifiedCount < 1) return false;
            }catch(error:any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            } 
        }else{
            if(newPassword == null) throw new HttpException('Vous devez spécifier un mot de passe', HttpStatus.CONFLICT);
            const newHashedPassword=await bcrypt.hash(newPassword, SALT_VALUE);
            try{
                const result=await this.drawingModel.updateOne({_id:drawingID}, {password: newHashedPassword, isPasswordProtected:true});
                if(result.modifiedCount < 1) return false;
            }catch(error:any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            } 
        }
        return true;
    }

    async changeDrawingExposition(drawingID: string, userID:string): Promise<boolean>{
        const access = await this.userHasAccessToDrawing(userID, drawingID);
        if(!access) throw new HttpException('Vous ne pouvez pas exposer le dessin', HttpStatus.CONFLICT);
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) throw new HttpException('Vous ne pouvez pas exposer le dessin', HttpStatus.CONFLICT);
        if(drawing.isPublic) throw new HttpException('Vous ne pouvez pas exposer le dessin dans un album public', HttpStatus.CONFLICT);
        try{
            
            const modified = await this.drawingModel.updateOne({_id: drawing._id.toString()}, {isExposed: !drawing.isExposed});
            if(modified.modifiedCount<1) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeDrawingOwnership(oldOwnerID: string, newOwnerID: string): Promise<boolean>{
        try{
            await this.drawingModel.updateMany({owner:oldOwnerID}, {owner:newOwnerID});
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    //real time related

    async authorizeToSendDrawingCommand(drawingID: string, tokenname: string, password?:string): Promise<boolean>{
        if(drawingID == null || tokenname == null) return false;
        try{
            const userdata: UserClientSide | undefined=await this.authService.isUserConnected(tokenname);
            if (!userdata){
                return false;
            }
            const access: boolean = await this.allowUserToContributeDrawing(drawingID, userdata._id.toString(), password);
            return access;
        }catch(error:any){
            return false;
        }
    }
    
    async addCommand(drawingID: string, commandFromClient: CommandFromClientDto, owner:string): Promise<Command> {
        try{
            const drawing=await this.drawingModel.findById(drawingID);
            if(drawing == null) throw new HttpException('Ce dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
            const user = await this.userService.findOneByID(owner);
            if(user == null) throw new HttpException('Cet utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
            const command: Command = {
                timestamp: new Date(),
                owner: user,
                command: commandFromClient,
                commandNumber: drawing.numberOfCommand,
                drawing: drawing
            };
            const commandCreated = await this.commandModel.create(command);
            const result = await this.drawingModel.updateOne({_id:drawingID},
                {
                    $push: {
                        commands: commandCreated
                    },
                    $inc: {numberOfCommand: 1}
                }
            );
            if(result == null) throw new HttpException('Ce dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
            return commandCreated;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateUserCollaborationTime(userID: string, time: number): Promise<void>{
        await this.userService.updateUserCollaborationTime(userID, time);
    }

    async addMessage(drawingID: string, message: MessageToClientDrawingDto): Promise<void> {
        const user = await this.userService.findOneByID(message._id);
        if(user == null) return;
        const messageTosave: Message = {message: message.message, timestamp: message.timestamp, user: user};
        try{
            const messageCreated = await this.roomService.messageModel.create(messageTosave);
            if(messageCreated == null) return;
            const result=await this.drawingModel.updateOne({_id:drawingID}, {
                $push: {
                    messages: messageCreated
                }
            });
            await this.userService.incrementUserMessageSent(message._id);
            if(result.modifiedCount < 1) throw new HttpException('Ce dessin n\'existe pas', HttpStatus.INTERNAL_SERVER_ERROR);
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllMessagesInDrawing(drawingID: string): Promise<MessageToClientDrawingDto[]>{
        try{
            const drawing = await this.drawingModel.findOne({_id:drawingID}).populate(
                { 
                    path: 'messages',
                    options:{ sort: { 'timestamp': 1 } },
                    populate: {
                        path: 'user',
                        model: 'User'
                    }, 
                }
            ).exec();
            if(drawing == null) return [];
            const messagesToClient:MessageToClientDrawingDto[] = drawing.messages.map((messageFromDatabase: Message)=> {
                return {
                    timestamp: messageFromDatabase.timestamp,
                    _id: messageFromDatabase.user._id.toString(),
                    username: messageFromDatabase.user.username,
                    message: messageFromDatabase.message
                };
            });
            return messagesToClient;
        }catch(error:any){
            throw new HttpException('Le canal n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    //picture related
    async changeDrawingPicturePath(drawingID: string, path: string): Promise<boolean>{
        try{
            const result = await this.drawingModel.updateOne({_id:drawingID},{drawingPath: path});
            if(result.matchedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeGifPicturePath(drawingID: string, path: string): Promise<boolean>{
        try{
            const result = await this.drawingModel.updateOne({_id:drawingID},{gifPath: path});
            if(result.matchedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async updateDrawingLastUpdateTime(drawingID: string): Promise<void>{
        if(drawingID == null) return;
        try{
            await this.drawingModel.updateOne({_id: drawingID}, {lastUpdate: new Date()});
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }    
    }

    async updateDrawingLastPictureUpdateTime(drawingID: string): Promise<void>{
        if(drawingID == null) return;
        try{
            await this.drawingModel.updateOne({_id: drawingID}, {lastImageUpdate: new Date()});
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }    
    }

    async updateDrawingLastGifUpdateTime(drawingID: string): Promise<void>{
        if(drawingID == null) return;
        try{
            await this.drawingModel.updateOne({_id: drawingID}, {lastGifUpdate: new Date()});
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }    
    }

    async pictureIsOutdated(drawingID: string): Promise<boolean>{
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) throw new HttpException('Ce dessin n\'existe pas', HttpStatus.CONFLICT);
        if(drawing.lastImageUpdate <= drawing.lastUpdate) return true;
        return false;
    }

    async gifIsOutdated(drawingID: string): Promise<boolean>{
        const drawing = await this.findDrawingByID(drawingID);
        if(drawing == null) throw new HttpException('Ce dessin n\'existe pas', HttpStatus.CONFLICT);
        if(drawing.lastGifUpdate <= drawing.lastUpdate) return true;
        return false;
    }
}
