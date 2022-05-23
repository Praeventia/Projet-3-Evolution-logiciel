import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { DEFAULT_AVATAR, MAIN_ROOM, SALT_VALUE } from 'src/const';
import { Room } from 'src/rooms/schema/rooms.schema';
import { User, UserClientSide, UserDocument } from './schemas/users.schema';
import { ObjectId } from 'mongoose';
import { Drawing } from 'src/drawings/schema/drawing.schema';
import { Album } from 'src/albums/schema/album.schema';
import { DrawingClientSide } from 'src/drawings/dto/drawing-client-side.dto';


@Injectable()
export class UsersService {   
    constructor(@InjectModel(User.name) public userModel: Model <UserDocument>) { }

    async findOneByUsername(username: string): Promise<User | undefined>{
        try{        
            const result = await this.userModel.findOne({username:username}).exec();
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        try{
            const result = await this.userModel.findOne({email:email}).exec();
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOneByID(id: ObjectId | string): Promise<User | undefined> {
        try{
            const result = await this.userModel.findById(id).exec();
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOneByIDWithRoom(id: string): Promise<User | undefined> {
        try{
            const result = await this.userModel.findById(id).populate('rooms').exec();
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOneByIDWithDrawing(id: string): Promise<User | undefined> {
        try{
            const result = await this.userModel.findById(id).populate(
                { 
                    path: 'drawings',
                    options:{ sort: { 'creationDate': 1 } },
                }
            ).exec();
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOneByIDWithAlbum(id: string): Promise<User | undefined> {
        try{
            const result = await this.userModel.findById(id).populate('albums').exec();
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async isUserAlreadyThere(email: string, username: string): Promise<void> {
        const user_username= await this.findOneByUsername(username);
        const user_email = await this.findOneByEmail(email);
        if (user_username) throw new HttpException('Le nom d\'utilisateur est déjà présent', HttpStatus.CONFLICT);
        if (user_email) throw new HttpException('Le courriel est déjà présent', HttpStatus.CONFLICT);
    }

    async userDataForClientSide(id: ObjectId): Promise<UserClientSide>{
        const user = await this.findOneByID(id);
        if(user == null) throw new HttpException('\'utilisateur n\'existe pas', HttpStatus.FORBIDDEN);
        return { email: user.email, username : user.username, _id: user._id.toString(), isEmailProtected: user.isEmailProtected };
    }

    async updateUserLastLoginTime(id: string, time:number): Promise<void> {
        try{
            await this.userModel.updateOne({_id: id}, {
                lastLoginTime: time,
                $push: {
                    allLoginDate: new Date()
                }
            });
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async incrementUserMessageSent(id:string):Promise<void>{
        try{
            await this.userModel.updateOne({_id: id}, {
                $inc: {numberOfMessageSent:1}
            });
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async incrementUserLineCount(id:string):Promise<void>{
        try{
            await this.userModel.updateOne({_id: id}, {
                $inc: {lineCount:1}
            });
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async incrementUserShapeCount(id:string):Promise<void>{
        try{
            await this.userModel.updateOne({_id: id}, {
                $inc: {shapeCount:1}
            });
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async incrementUserPixelCross(id:string, numberOfPixelCross: number): Promise<void>{
        try{
            await this.userModel.updateOne({_id: id}, {
                $inc: {pixelCross: numberOfPixelCross}
            });
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async updateUserDisconnectTime(id: string): Promise<void> {
        try{
            await this.userModel.updateOne({_id: id}, {
                $push: {
                    allDisconnectDate: new Date()
                }
            });
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateUserCollaborationTime(id: string, time:number): Promise<void> {
        time = Math.floor(time);
        try{
            await this.userModel.updateOne({_id: id}, 
                {
                    $inc:{totalEditionTime: time},
                    $push: {
                        timePerEdition: time
                    }
                }
            );
        }
        catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async changeUsername(id: string, newUsername: string): Promise<boolean>{
        const isUserAlreadyThere = await this.findOneByUsername(newUsername);
        if(isUserAlreadyThere) throw new HttpException('Le nom d\'utilisateur est déjà présent', HttpStatus.CONFLICT);
        try{
            const result=await this.userModel.updateOne({_id:id}, {username : newUsername});
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeAvatarPath(id: string, avatarPath: string): Promise<boolean>{
        if(id == null || avatarPath == null) return false;
        try{
            const result = await this.userModel.updateOne({_id:id}, {avatarPath:avatarPath});
            if(result.matchedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeEmailProtection(id: string): Promise<boolean>{
        if(id == null) return false;
        try{
            const user: User = await this.findOneByID(id);
            if(user == null) return false;
            const result = await this.userModel.updateOne({_id:id}, {isEmailProtected: !user.isEmailProtected});
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async addUser(username: string, password: string, email:string): Promise<UserClientSide | undefined > {
        await this.isUserAlreadyThere(email, username); 
        const hashPassword=await bcrypt.hash(password, SALT_VALUE);
        const newUser: User={
            username: username,
            password: hashPassword,
            email: email,
            lastLoginTime: 0,
            pixelCross: 0,
            lineCount:0,
            shapeCount:0,
            isEmailProtected:false,
            numberOfMessageSent: 0,
            rooms: [],
            drawings: [],
            albums:[],
            allLoginDate:[],
            allDisconnectDate:[],
            avatarPath: DEFAULT_AVATAR,
            totalEditionTime:0,
            timePerEdition:[]
        };
        try{
            const result: User= await this.userModel.create(newUser);
            return this.userDataForClientSide(result._id);
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //ROOM

    async userHasAccessToRoom(id:string, roomName: string): Promise<boolean> {
        const allUsers = await this.findOneByIDWithRoom(id);
        if(allUsers == null) return false;
        const room = allUsers.rooms;
        const allRoomNames = room.map((room: Room) => room.roomName);
        return allRoomNames.includes(roomName);
    }

    async getAllRoomsForUser(id: string): Promise<string[] | undefined>{
        try{
            const user = await this.findOneByIDWithRoom(id);
            if(user == null) return undefined;

            const rooms = user.rooms;
            return rooms.map((room: Room) => room.roomName);
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addRoomToUser(id: string, room: Room): Promise<boolean>{
        try{
            const result=await this.userModel.updateOne({_id:id}, {
                $addToSet: {
                    rooms: room
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async removeRoomToUser(id: string, room: Room): Promise<boolean> {
        try{
            const result=await this.userModel.updateOne({_id:id}, {
                $pull: {
                    rooms: room._id
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async countAllUserInRoom(room: Room): Promise<number | undefined> {
        try{
            const result=await this.userModel.find({
                rooms: room._id
            });
            if(result == null) return undefined;
            return result.length;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeRoomToEveryUser(room: Room): Promise<boolean> {
        if(room.roomName === MAIN_ROOM) return false;
        try{
            const result=await this.userModel.updateMany({}, {
                $pull: {
                    rooms: room._id
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async getNumberOfMessageSentUser(userID: string): Promise<number>{
        try{

            const user = await this.userModel.findById(userID);
            if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.CONFLICT);
            return user.numberOfMessageSent;

        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async getNumberOfPixelCross(userID: string): Promise<number>{
        try{

            const user = await this.userModel.findById(userID);
            if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.CONFLICT);
            return user.pixelCross;

        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    // DRAWING  


    async userHasAccessToDrawing(id:string, drawingID: string): Promise<boolean> {
        try{
            const user = await this.userModel.findOne({_id:id, drawings: drawingID});
            if(user == null) return false;    
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async getAllContributedDrawingForUser(id: string): Promise<string[] | undefined>{
        try{
            const user = await this.findOneByIDWithDrawing(id);
            if(user == null) return undefined;

            const drawings = user.drawings;
            return drawings.map((drawing: Drawing) => drawing._id.toString());
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllContributedDrawingForUser2(id: string): Promise<DrawingClientSide[]>{
        try{
            const user = await this.findOneByIDWithDrawing(id);
            if(user == null) return undefined;
            const drawings = user.drawings;
            return drawings.map((drawing: Drawing) => {
                return {
                    drawingName: drawing.drawingName,
                    isPublic: drawing.isPublic,
                    isPasswordProtected: drawing.isPasswordProtected,
                    album: drawing.album._id.toString(),
                    owner: drawing.owner._id.toString(),
                    isExposed: drawing.isExposed,
                    creationDate: drawing.creationDate,
                    _id: drawing._id.toString()
                };
            });
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addUserToContributeDrawing(id: string, drawing: Drawing): Promise<boolean>{
        try{
            await this.userModel.updateOne({_id:id}, {
                $addToSet: {
                    drawings: drawing
                }
            });
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async removeDrawingToUser(id: string, drawing: Drawing): Promise<boolean> {
        try{
            const result=await this.userModel.updateOne({_id:id}, {
                $pull: {
                    drawings: drawing._id
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async removeDrawingToEveryUser(drawing: Drawing): Promise<boolean> {
        try{
            const result=await this.userModel.updateMany({}, {
                $pull: {
                    drawings: drawing._id
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }


    //ALBUM


    async userHasAccessToAlbum(id:string, albumID: string): Promise<boolean> {
        const user = await this.userModel.findOne({_id:id, albums: albumID});
        if(user == null) return false;
        return true;
    }

    async getAllJoinAlbumForUser(id: string): Promise<string[]>{
        try{
            const user = await this.findOneByIDWithAlbum(id);
            if(user == null) return [];

            const albums = user.albums;
            return albums.map((album: Album) => album._id.toString());
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllJoinPrivateAlbumForUser(id: string): Promise<string[]>{
        try{
            const user = await this.findOneByIDWithAlbum(id);
            if(user == null) return [];

            const albums = user.albums.filter((album: Album) => !album.isPublic);
            return albums.map((album: Album) => album._id.toString());
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllOwnedAlbumForUser(id: string): Promise<string[]>{
        try{
            const user = await this.findOneByIDWithAlbum(id);
            if(user == null) return [];

            const albums = user.albums.filter((album: Album) => album?.owner?._id.toString() === id);
            return albums.map((album: Album) => album._id.toString());
        }catch(error: any){
            console.log(error);
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async allowUserToJoinAlbum(id: string, album: Album): Promise<boolean>{
        try{
            const result=await this.userModel.updateOne({_id:id}, {
                $addToSet: {
                    albums: album
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async removeAlbumToUser(id: string, album: Album): Promise<boolean> {
        try{
            const result=await this.userModel.updateOne({_id:id}, {
                $pull: {
                    albums: album._id
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async countUserInAlbum(album: Album): Promise<number | undefined> {
        try{
            const result=await this.userModel.find({
                albums: album._id
            });
            if(result == null) return undefined;
            return result.length;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeAlbumToEveryUser(album: Album): Promise<boolean> {
        try{
            const result=await this.userModel.updateMany({}, {
                $pull: {
                    albums: album._id
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

}
