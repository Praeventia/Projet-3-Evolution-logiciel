import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MAIN_ALBUM } from 'src/const';
import { DrawingsService } from 'src/drawings/drawings.service';
import { DrawingClientSide } from 'src/drawings/dto/drawing-client-side.dto';
import { Drawing } from 'src/drawings/schema/drawing.schema';
import { User } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { AllAlbumInfoDto } from './dto/all-album-info.dto';
import { Album, AlbumDocument } from './schema/album.schema';

@Injectable()
export class AlbumsService {

    constructor(@InjectModel(Album.name) public albumModel: Model <AlbumDocument>, private readonly userService: UsersService, private readonly drawingService: DrawingsService) {
        this.initAlbum();
    }

    async initAlbum(): Promise<void>{
        const mainAlbum = await this.findAlbumByAlbumName(MAIN_ALBUM);
        if(mainAlbum == null){
            const newAlbum: Album = {
                albumName: MAIN_ALBUM,
                isPublic: true, 
                owner: null,
                description: 'Album principal',
                creationDate: new Date(),
                usersRequestedToJoin: [],
            };
            try{
                await this.albumModel.create(newAlbum);
            }catch(error: any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async allAlbum(userID: string): Promise<AllAlbumInfoDto[]>{
        try{
            const allAlbum = await this.albumModel.find().sort({creationDate:1}).exec();
            if(allAlbum == null) throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            const allAlbumInfo: AllAlbumInfoDto[] = await Promise.all(allAlbum.map(async (album: Album): Promise<AllAlbumInfoDto>=> {
                return {
                    albumID: album._id.toString(),
                    albumName: album.albumName,
                    albumDescription: album.description,
                    creationDate: album.creationDate,
                    isPublic: album.isPublic,
                    isOwner: await this.userIsOwnerOfAlbum(userID, album._id.toString()),
                    isJoin: await this.userHasAccessToAlbum(userID, album._id.toString())
                };
            }));
            return allAlbumInfo;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    async allAlbumWithExposition(): Promise<string[]>{
        try{
            const result = await this.drawingService.drawingModel.find({isExposed:true}).distinct('album');
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    async userHasAccessToAlbum(userID: string, albumID: string): Promise<boolean>{
        const result = await this.userService.userHasAccessToAlbum(userID, albumID);
        return result;
    }

    async userIsOwnerOfAlbum(userID: string, albumID: string): Promise<boolean>{
        const album = await this.findAlbumByID(albumID);
        if(album == null) return false;
        if(album?.owner?._id.toString() === userID) return true;
        return false;
    }

    async requestToJoinPrivateAlbum(userID: string, albumID: string): Promise<boolean>{
        const isAlreadyThere = await this.userHasAccessToAlbum(userID, albumID);
        if(isAlreadyThere) throw new HttpException('L\'utilisateur est déjà dans l\'album', HttpStatus.CONFLICT); 
        const user = await this.userService.findOneByID(userID);
        if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.CONFLICT);
        try{
            const result=await this.albumModel.updateOne({_id:albumID}, {
                $addToSet: {
                    usersRequestedToJoin:user
                }
            });
            if(result == null) throw new HttpException('Cet album n\'existe pas', HttpStatus.INTERNAL_SERVER_ERROR);
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

   
    async findAlbumByAlbumName(albumName: string): Promise<Album | undefined> {
        try{
            const album = await this.albumModel.findOne({albumName:albumName}).exec();
            return album;
        }catch(error:any){
            throw new HttpException('L\'album n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async findAlbumByID(id: string): Promise<Album | undefined> {
        try{
            const album = await this.albumModel.findById(id);
            return album;
        }catch(error:any){
            throw new HttpException('L\'album n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }

    async findAlbumByIDAndPopulateUserRequestingToBeAdd(id: string): Promise<Album | undefined> {
        try{
            const album = await this.albumModel.findById(id).populate('usersRequestedToJoin').exec();
            return album;
        }catch(error:any){
            throw new HttpException('L\'album n\'existe pas', HttpStatus.BAD_REQUEST);
        }
    }


    async createAlbum(albumName: string, userID:string, isPublic:boolean, description: string): Promise<Album> {
        const drawing = await this.findAlbumByAlbumName(albumName);
        if(drawing) throw new HttpException('Cette album existe déjà', HttpStatus.CONFLICT);
        const owner = await this.userService.findOneByID(userID);
        if(owner == null) throw new HttpException('Le propriétaire n\'existe pas', HttpStatus.CONFLICT); 
        
        const newAlbum: Album = {
            albumName: albumName,
            isPublic: isPublic, 
            owner: owner,
            description: description,
            creationDate: new Date(),
            usersRequestedToJoin: [],
        };
        try{
            const result: Album= await this.albumModel.create(newAlbum);
            this.userService.allowUserToJoinAlbum(userID, result);
            return result;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllDrawingInAlbum(albumID: string): Promise<string[]> {
        const allDrawing: Drawing[] = await this.drawingService.drawingModel.find({album:albumID}).sort({creationDate:1});
        if(allDrawing == null) return [];
        return allDrawing.map((drawing: Drawing) => drawing._id.toString());
    }

    async getAllDrawingInAlbum2(albumID: string): Promise<DrawingClientSide[]> {
        const allDrawing: Drawing[] = await this.drawingService.drawingModel.find({album:albumID}).sort({creationDate:1});
        if(allDrawing == null) return [];
        return allDrawing.map((drawing: Drawing) => {
            return {
                drawingName: drawing.drawingName,
                isPublic: drawing.isPublic,
                isPasswordProtected: drawing.isPasswordProtected,
                album: albumID,
                owner: drawing.owner._id.toString(),
                isExposed: drawing.isExposed,
                creationDate: drawing.creationDate,
                _id: drawing._id.toString()
            };
        });
    }

    async getAllExposedDrawingInAlbum(albumID: string): Promise<string[]> {
        const allDrawing: Drawing[] = await this.drawingService.drawingModel.find({album:albumID, isExposed:true}).sort({creationDate:1});
        if(allDrawing == null) return [];
        return allDrawing.map((drawing: Drawing) => drawing._id.toString());
    }


    async getAllJoinAlbumForUser(userID: string): Promise<string[]> {
        const albumsID= await this.userService.getAllJoinAlbumForUser(userID);
        if(albumsID == null) return [];
        return albumsID;
    }

    async getAllJoinPrivateAlbumForUser(userID: string): Promise<string[]> {
        const albumsID= await this.userService.getAllJoinPrivateAlbumForUser(userID);
        if(albumsID == null) return [];
        return albumsID;
    }

    async getAllOwnedAlbumForUser(userID: string): Promise<string[]> {
        const albumsID= await this.userService.getAllOwnedAlbumForUser(userID);
        if(albumsID == null) return [];
        return albumsID;
    }

    async getAllUserRequestingToBeAdd(albumID:string): Promise<string[]>{
        const album = await this.findAlbumByIDAndPopulateUserRequestingToBeAdd(albumID);
        if(album == null) return [];
        return album.usersRequestedToJoin.map((user: User) => user._id.toString());
    }

    async allowUserToJoinPrivateAlbum(albumID: string, userID: string, userIDToAdd: string): Promise<boolean> {
        const album = await this.findAlbumByID(albumID);
        if(album == null) return false;
        const access = await this.userService.userHasAccessToAlbum(userID, albumID);
        if(!access) throw new HttpException('L\'utilisateur ne peut pas permettre de rajouter cet utilisateur.', HttpStatus.CONFLICT);
        try{
            const userHasAskToBeInAlbum = await this.albumModel.findOne({_id:albumID, usersRequestedToJoin:userIDToAdd});
            if(userHasAskToBeInAlbum == null) throw new HttpException('L\'utilisateur n\'a pas été rajouté.', HttpStatus.CONFLICT);
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const success =await this.userService.allowUserToJoinAlbum(userIDToAdd, album);
        if(!success)throw new HttpException('L\'utilisateur n\'a pas été rajouté.', HttpStatus.CONFLICT);
        await this.removeUserFromRequestedToJoin(albumID, userIDToAdd);
        return true;
    }

    async allowUserToJoinAlbum(albumID: string, userID: string): Promise<boolean> {
        const album = await this.findAlbumByID(albumID);
        if(album == null) return false;
        const success =await this.userService.allowUserToJoinAlbum(userID, album);
        if(!success) throw new HttpException('L\'utilisateur n\'a pas été rajouté.', HttpStatus.CONFLICT);
        return true;
    }

    async removeUserFromRequestedToJoin(albumID: string, userID: string): Promise<boolean>{
        try{
            const result=await this.albumModel.updateOne({_id:albumID}, {
                $pull: {
                    usersRequestedToJoin: userID
                }
            });
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }


    async removeUserFromAlbum(albumID: string, userID: string): Promise<boolean> {
        const album = await this.findAlbumByID(albumID);
        if(album == null) return false;
        if(album.albumName === MAIN_ALBUM) throw new HttpException('L\'utilisateur ne peut pas quitter l\'album principal', HttpStatus.CONFLICT);
        const isOwner = await this.userIsOwnerOfAlbum(userID, albumID);
        if(isOwner) throw new HttpException('Le propriétaire ne peut pas quitter son album', HttpStatus.CONFLICT);
        const changeDrawingOwnership = await this.drawingService.changeDrawingOwnership(userID, album?.owner?._id.toString());
        const state = await this.userService.removeAlbumToUser(userID, album);
        const nbOfUser = await this.userService.countUserInAlbum(album);
        if(nbOfUser === 0){
            try{
                await this.deleteAlbum(albumID);
            }catch(error:any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
        }
        return state && changeDrawingOwnership;
    }

    async deleteAlbum(albumID: string): Promise<boolean> {
        const album = await this.findAlbumByID(albumID);
        if(album == null) return false;
        if(album.albumName === MAIN_ALBUM) throw new HttpException('L\'album principal ne peut pas être supprimé', HttpStatus.CONFLICT);
        try{
            const allDrawing: Drawing[] = await this.drawingService.drawingModel.find({album:albumID});
            for(const drawing of allDrawing){
                this.drawingService.deleteDrawing(drawing._id.toString());
            }
            const result = await this.userService.removeAlbumToEveryUser(album);
            const resultDelete = await this.albumModel.deleteOne({_id: albumID});
            if(resultDelete.deletedCount === 0 || !result) return false;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async deleteAlbumFromUser(albumID: string, userID:string): Promise<boolean> {
        if(userID != null){
            const userAccess = await this.userIsOwnerOfAlbum(userID, albumID);
            if(!userAccess) throw new HttpException('Seulement le propriétaire peut supprimer un album', HttpStatus.CONFLICT);
        }
        const result = await this.deleteAlbum(albumID);
        return result;
    }

    async changeAlbumName(albumID: string, userID:string, newAlbumName: string): Promise<boolean>{
        const userAccess = await this.userIsOwnerOfAlbum(userID, albumID);
        if(!userAccess) throw new HttpException('Seulement le propriétaire peut changer le nom d\'un dessin', HttpStatus.CONFLICT);
        const album = await this.findAlbumByAlbumName(newAlbumName);
        if(album != null) throw new HttpException('Le nom de cette album existe déjà', HttpStatus.CONFLICT);
        try{
            const result=await this.albumModel.updateOne({_id:albumID}, {albumName: newAlbumName});
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }

    async changeAlbumDescription(albumID: string, userID:string, newDescription: string): Promise<boolean>{
        const userAccess = await this.userIsOwnerOfAlbum(userID, albumID);
        if(!userAccess) throw new HttpException('Seulement le propriétaire peut supprimer un dessin', HttpStatus.CONFLICT);
        try{
            const result=await this.albumModel.updateOne({_id:albumID}, {description: newDescription});
            if(result.modifiedCount < 1) return false;
        }catch(error: any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }
}
