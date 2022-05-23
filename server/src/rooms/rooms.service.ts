import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageToClientDto } from 'src/chat/dto/message-to-client.dto';
import { MAIN_ROOM } from 'src/const';
import { UsersService } from 'src/users/users.service';
import { Message, MessageDocument, Room, RoomDocument } from './schema/rooms.schema';

@Injectable()
export class RoomsService {

    constructor(
        @InjectModel(Room.name) private roomModel: Model <RoomDocument>,
        @InjectModel(Message.name) public messageModel: Model <MessageDocument>,
        private readonly usersService: UsersService) {
        this.initRoom();
    }
        

    async initRoom(): Promise<void>{
        const mainRoom = await this.findRoomByRoomName(MAIN_ROOM);
        if(mainRoom == null){
            const newRoom: Room = { roomName: MAIN_ROOM, messages: [] };
            try{
                await this.roomModel.create(newRoom);
            }catch(error: any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async findRoomByRoomName(roomName: string): Promise<Room | undefined> {
        try{
            const room = await this.roomModel.findOne({roomName:roomName}).exec();
            return room;
        }catch(error:any){
            throw new HttpException('Le canal n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async findRoomByRoomNamePopulateMessage(roomName: string): Promise<Room | undefined> {
        try{
            const room = await this.roomModel.findOne({roomName:roomName}).populate(
                { 
                    path: 'messages',
                    options:{ sort: { 'timestamp': 1 } },
                    populate: {
                        path: 'user',
                        model: 'User'
                    }, 
                }
            ).exec();
            return room;
        }catch(error:any){
            throw new HttpException('Le canal n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async findRoomByID(id: string): Promise<Room | undefined> {
        try{
            const room = await this.roomModel.findById(id);
            return room;
        }catch(error:any){
            throw new HttpException('Le canal n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }


    async createRoom(roomName: string, id:string): Promise<boolean> {
        const room = await this.findRoomByRoomName(roomName);
        if(room) throw new HttpException('Ce canal existe déjà', HttpStatus.CONFLICT);

        const newRoom: Room = { roomName: roomName, messages: [] };
        try{
            const result: Room= await this.roomModel.create(newRoom);
            this.usersService.addRoomToUser(id, result);
            return true;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllMessagesInRoom(roomName: string): Promise<MessageToClientDto[] | undefined > {
        const room = await this.findRoomByRoomNamePopulateMessage(roomName);
        if(room == null) return undefined;
        const messages: Message[] = room.messages;
        const messagesToClient :MessageToClientDto[] = messages.map((messageFromDatabase: Message)=> {
            return {
                timestamp: messageFromDatabase.timestamp,
                _id: messageFromDatabase.user._id.toString(),
                username: messageFromDatabase.user.username,
                room: roomName,
                message: messageFromDatabase.message
            };
        });
        return messagesToClient;
    }

    async getAllRooms(): Promise<string[] | undefined > {
        try{
            const result = await this.roomModel.find();
            if(result == null) return undefined;
            return result.map((room: Room) => room.roomName);
        }catch(erreur: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        
    }

    async getAllRoomsForUser(id: string): Promise<string[] | undefined> {
        const roomsUsers= await this.usersService.getAllRoomsForUser(id);
        if(roomsUsers == null) return undefined;
        return roomsUsers;
    }

    async addMessage(roomName: string, message: MessageToClientDto): Promise<void> {
        const user = await this.usersService.findOneByID(message._id);
        if(user == null) return;
        const messageTosave: Message = {message: message.message, timestamp: message.timestamp, user: user};
        try{
            const messageCreated = await this.messageModel.create(messageTosave);
            if(messageCreated == null) return;
            const result=await this.roomModel.updateOne({roomName:roomName}, {
                $push: {
                    messages: messageCreated
                }
            });
            await this.usersService.incrementUserMessageSent(message._id);
            if(result.modifiedCount < 1) throw new HttpException('Ce canal n\'existe pas', HttpStatus.INTERNAL_SERVER_ERROR);
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async userHasAccessToRoom(id: string, roomName: string): Promise<boolean>{
        const result = await this.usersService.userHasAccessToRoom(id, roomName);
        return result;
    }

    async addUserToRoom(roomName: string, id: string): Promise<boolean> {
        const room = await this.findRoomByRoomName(roomName);
        if(room == null) return false;
        return this.usersService.addRoomToUser(id, room);

    }

    async removeUserFromRoom(roomName: string, id: string): Promise<boolean> {
        if(roomName === MAIN_ROOM) return false;
        const room = await this.findRoomByRoomName(roomName);
        if(room == null) return false;
        const state = await this.usersService.removeRoomToUser(id, room);
        const nbOfUser = await this.usersService.countAllUserInRoom(room);
        if(nbOfUser === 0){
            try{
                await this.roomModel.deleteOne({roomName: room.roomName});
            }catch(error:any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
        }
        return state;
    }

    async deleteRoom(roomName: string, id:string): Promise<boolean> {
        if(roomName === MAIN_ROOM) return false;
        const userAccess = await this.userHasAccessToRoom(id, roomName);
        if(!userAccess) return false;
        try{
            const room = await this.findRoomByRoomName(roomName);
            if(room == null) return false;
            const result = await this.usersService.removeRoomToEveryUser(room);
            const resultDelete = await this.roomModel.deleteOne({roomName: roomName});
            if(resultDelete.deletedCount === 0 || !result) return false;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }
}
