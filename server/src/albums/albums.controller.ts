import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DrawingsService } from 'src/drawings/drawings.service';
import { AlbumsService } from './albums.service';
import { AlbumInfoDto } from './dto/album-info.dto';
import { AllAlbumInfoDto } from './dto/all-album-info.dto';
import { ChangeAlbumDescriptionDto } from './dto/change-album-description-dto';
import { ChangeAlbumDrawingDto } from './dto/change-album-drawing.dto';
import { ChangeAlbumNameDto } from './dto/change-album-name-dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { DrawingInfoDto } from './dto/drawing-info.dto';
import { JoinPrivateAlbumDto } from './dto/join-private-album.dto';
import { RejectJoinPrivateAlbumDto } from './dto/reject-join-private-album.dto';

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
    constructor(private readonly drawingsService: DrawingsService, private readonly albumsService: AlbumsService) {}


    //ALBUM RELATED

    @Get('albumInfo/:albumID')
    async getDrawingID(@Request() req, @Param() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const allAlbumInfo: AllAlbumInfoDto = {
            albumID: album._id.toString(),
            albumName: album.albumName,
            albumDescription: album.description,
            isPublic: album.isPublic,
            creationDate: album.creationDate,
            isOwner: await this.albumsService.userIsOwnerOfAlbum(req.user._id, album._id.toString()),
            isJoin: await this.albumsService.userHasAccessToAlbum(req.user._id, album._id.toString())
        };
        return allAlbumInfo;
    }

    @Get('userIsOwnerOfAlbum/:albumID')
    async userIsOwnerOFAlbum(@Request() req, @Param() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const access = await this.albumsService.userIsOwnerOfAlbum(req.user._id, albumInfoDto.albumID);
        return access;
    }

    @Get('allAlbum')
    async getAllAlbum(@Request() req){
        const allAlbumInfo = await this.albumsService.allAlbum(req.user._id);
        return allAlbumInfo;
    }

    @Get('allAlbumWithExposition')
    async allAlbumWithExposition(){
        const allAlbumWithExpostionInfo = await this.albumsService.allAlbumWithExposition();
        return allAlbumWithExpostionInfo;
    }

    @Get('allUserRequestingToJoinAlbum/:albumID')
    async getAllUserRequestingToJoin(@Request() req, @Param() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.albumsService.getAllUserRequestingToBeAdd(albumInfoDto.albumID);
        return result;
    }

    @Get('allDrawingInAlbum/:albumID')
    async allDrawingInAlbum(@Request() req, @Param() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const access = this.albumsService.userHasAccessToAlbum(req.user._id, albumInfoDto.albumID);
        if(!access) throw new HttpException('L\'utilisateur ne peut pas voir cette album', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.albumsService.getAllDrawingInAlbum(albumInfoDto.albumID);
        return result;
    }

    @Get('allDrawingInAlbum2/:albumID')
    async allDrawingInAlbum2(@Request() req, @Param() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const access = this.albumsService.userHasAccessToAlbum(req.user._id, albumInfoDto.albumID);
        if(!access) throw new HttpException('L\'utilisateur ne peut pas voir cette album', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.albumsService.getAllDrawingInAlbum2(albumInfoDto.albumID);
        return result;
    }

    @Get('allExposedDrawingInAlbum/:albumID')
    async allExposedDrawingInAlbum(@Request() req, @Param() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.albumsService.getAllExposedDrawingInAlbum(albumInfoDto.albumID);
        return result;
    }

    @Get('allAlbumJoin')
    async allAlbumJoin(@Request() req){
        const result = await this.albumsService.getAllJoinAlbumForUser(req.user._id);
        return result;
    }

    @Get('allPrivateAlbumJoin')
    async allPrivateAlbumJoin(@Request() req){
        const result = await this.albumsService.getAllJoinPrivateAlbumForUser(req.user._id);
        return result;
    }

    @Get('allOwnedAlbum')
    async allOwnedAlbum(@Request() req){
        const result = await this.albumsService.getAllOwnedAlbumForUser(req.user._id);
        return result;
    }

    @Post('allowUserToJoinPrivateAlbum')
    async allowUserToJoinPrivateAlbum(@Request() req, @Body() joinPrivateAlbumDto: JoinPrivateAlbumDto){
        const result = await this.albumsService.allowUserToJoinPrivateAlbum(joinPrivateAlbumDto.albumID, req.user._id, joinPrivateAlbumDto.userIDToAdd);
        if(!result) throw new HttpException('L\'utilisateur n\'a pas été rajouté', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('rejectUserToJoinPrivateAlbum')
    async rejectUserToJoinPrivateAlbum(@Request() req, @Body() rejectJoinPrivateAlbumDto: RejectJoinPrivateAlbumDto){
        const access = await this.albumsService.userHasAccessToAlbum(req.user._id, rejectJoinPrivateAlbumDto.albumID);
        if(!access) throw new HttpException('L\'utilisateur ne peut pas voir cette album', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.albumsService.removeUserFromRequestedToJoin(rejectJoinPrivateAlbumDto.albumID, rejectJoinPrivateAlbumDto.userIDToReject);
        if(!result) throw new HttpException('L\'utilisateur n\'a pas été retiré', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('requestToJoinPrivateAlbum')
    async requestToJoinPrivateAlbum(@Request() req, @Body() albumInfoDto: AlbumInfoDto){
        const album = await this.albumsService.findAlbumByID(albumInfoDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        if(album.isPublic) throw new HttpException('Cette album n\'est pas privé', HttpStatus.NOT_ACCEPTABLE);       
        const result = await this.albumsService.requestToJoinPrivateAlbum(req.user._id, albumInfoDto.albumID);
        if(!result) throw new HttpException('L\'utilisateur n\'a pas pu demander de rejoindre', HttpStatus.NOT_ACCEPTABLE);
    }


    @Post('changeDescription')
    async changeDescription(@Body() changeAlbumDescriptionDto: ChangeAlbumDescriptionDto, @Request() req){
        const result = await this.albumsService.changeAlbumDescription(changeAlbumDescriptionDto.albumID, req.user._id, changeAlbumDescriptionDto.description);
        if(!result) throw new HttpException('La description n\'a pas été modifié', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('changeAlbumName')
    async changeAlbumgName(@Body() changeAlbumNameDto: ChangeAlbumNameDto, @Request() req){
        const result = await this.albumsService.changeAlbumName(changeAlbumNameDto.albumID, req.user._id, changeAlbumNameDto.albumName);
        if(!result) throw new HttpException('Le nom de l\'album n\'a pas été modifié', HttpStatus.NOT_ACCEPTABLE);
    }

    @Put('createAlbum')
    async createAlbum(@Body() createAlbumDto: CreateAlbumDto, @Request() req){
        const newAlbum = await this.albumsService.createAlbum(createAlbumDto.albumName, req.user._id, false, createAlbumDto.description);
        if(!newAlbum) throw new HttpException('L\'album n\'a pas été créé', HttpStatus.NOT_ACCEPTABLE);
        return {albumID:newAlbum._id.toString()};
    }

    @Post('deleteAlbum')
    async deleteAlbum(@Body() albumInfoDto: AlbumInfoDto, @Request() req){
        const access = await this.albumsService.userIsOwnerOfAlbum(req.user._id, albumInfoDto.albumID);
        if(!access) throw new HttpException('Seulement le propriétaire peut supprimer un album', HttpStatus.NOT_ACCEPTABLE);
        const deleted = await this.albumsService.deleteAlbum(albumInfoDto.albumID);
        if(!deleted) throw new HttpException('L\'album n\'est pas supprimé', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('removeUserFromAlbum')
    async removeUserFromAlbum(@Body() albumInfoDto: AlbumInfoDto, @Request() req){
        const access = await this.albumsService.userHasAccessToAlbum(req.user._id, albumInfoDto.albumID);
        if(!access) throw new HttpException('L\'utilisateur n\'a pas été retiré', HttpStatus.NOT_ACCEPTABLE);
        const removed = await this.albumsService.removeUserFromAlbum(albumInfoDto.albumID, req.user._id);
        if(!removed) throw new HttpException('L\'utilisateur n\'a pas été retiré', HttpStatus.NOT_ACCEPTABLE);
    }

    //DRAWING RELATED

    @Put('createDrawing')
    async createDrawing(@Body() createDrawingDto:CreateDrawingDto, @Request() req){
        const album = await this.albumsService.findAlbumByID(createDrawingDto.albumID);
        if(album == null) throw new HttpException('Cette album n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const access = await this.albumsService.userHasAccessToAlbum(req.user._id, createDrawingDto.albumID);
        if(!access) throw new HttpException('L\'utilisateur n\'a pas accès à l\'album', HttpStatus.NOT_ACCEPTABLE);
        const isPasswordProtected = createDrawingDto.password != null;
        if(!album.isPublic && isPasswordProtected) throw new HttpException('Impossible de créer un dessin protégé dans un album privé', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.drawingsService.createDrawing(createDrawingDto.drawingName, req.user._id, album.isPublic, isPasswordProtected, album, createDrawingDto.password);
        if(result == null) throw new HttpException('Le dessin n\'a pas été créé', HttpStatus.NOT_ACCEPTABLE);
        return {drawingID:result._id.toString()};
    }


    @Post('deleteDrawing')
    async deleteDrawing(@Body() drawingInfoDto: DrawingInfoDto, @Request() req){
        const result = await this.drawingsService.deleteDrawingByUser(drawingInfoDto.drawingID, req.user._id);
        if(!result) throw new HttpException('Le canal n\'a pas été supprimé', HttpStatus.BAD_REQUEST);    
    }

    @Post('changeDrawingAlbum')
    async changeDrawingAlbum(@Body() changeAlbumDrawingDto: ChangeAlbumDrawingDto, @Request() req){
        const access = await this.drawingsService.userIsOwnerOfDrawing(req.user._id, changeAlbumDrawingDto.drawingID);
        if(!access) throw new HttpException('L\'utilisateur n\'a pas accès au dessin', HttpStatus.NOT_ACCEPTABLE);
        const albumAccess = await this.albumsService.userHasAccessToAlbum(req.user._id, changeAlbumDrawingDto.albumID);
        if(!albumAccess) throw new HttpException('L\'utilisateur n\'a pas accès à l\album', HttpStatus.NOT_ACCEPTABLE);
        const album = await this.albumsService.findAlbumByID(changeAlbumDrawingDto.albumID);
        const drawing = await this.drawingsService.findDrawingByID(changeAlbumDrawingDto.drawingID);
        if(drawing.album._id.toString() === album._id.toString()) throw new HttpException('Impossible de changer l\'album dans le même album', HttpStatus.NOT_ACCEPTABLE);
        if(album == null) throw new HttpException('L\'utilisateur n\'a pas accès à l\album', HttpStatus.NOT_ACCEPTABLE);
        if(!album.isPublic){
            //album de destination prive
            try{
                const result = await this.drawingsService.drawingModel.updateOne({_id: changeAlbumDrawingDto.drawingID},
                    {
                        isPublic:false,
                        isPasswordProtected:false,
                        album: album,
                        password: null,
                        isExposed:false,
                    }
                );
                if(result.modifiedCount<1) throw new HttpException('L\'album n\'a pas changé de propriétaire', HttpStatus.NOT_ACCEPTABLE);
            }catch(error:any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            } 
        }else{
            //dans l'album public
            try{
                const result = await this.drawingsService.drawingModel.updateOne({_id: changeAlbumDrawingDto.drawingID},
                    {
                        isPublic:true,
                        isPasswordProtected:false,
                        album: album,
                        password: null,
                        isExposed:false,
                    }
                );
                if(result.modifiedCount<1) throw new HttpException('L\'album n\'a pas changé de propriétaire', HttpStatus.NOT_ACCEPTABLE);
            }catch(error:any){
                throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
            } 

        }  
    }
}
