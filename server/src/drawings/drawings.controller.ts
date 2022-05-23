import { Controller, Request, Get, HttpException, HttpStatus , UseGuards, Param , Post, Body} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DrawingRealTimeService } from './drawings-real-time.service';
import { DrawingsService } from './drawings.service';
import { ChangeDrawingExpositionDto } from './dto/change-drawing-exposition.dto';
import { ChangeNameDrawingDto } from './dto/change-name-drawing.dto';
import { ChangePasswordDrawingDto } from './dto/change-password-drawing.dto';
import { ChangeProtectioNDrawingDto } from './dto/change-protection-drawing.dto';
import { SelectDrawingIDDto } from './dto/select-drawing-drawingID.dto';
import { VerifyPasswordDrawingDto } from './dto/verify-password-drawing.dto';
@Controller('drawings')
@UseGuards(JwtAuthGuard)
export class DrawingsController {
    constructor(private readonly drawingsService: DrawingsService, private readonly drawingRealTimeService: DrawingRealTimeService) {}
    @Get('drawingInfo/:drawingID')
    async getDrawingID(@Request() req, @Param() selectDrawingIDDto: SelectDrawingIDDto){
        const drawing = await this.drawingsService.findDrawingByID(selectDrawingIDDto.drawingID);
        if(drawing == null) throw new HttpException('Ce dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const access = await this.drawingsService.userCanSeeDrawing(req.user._id, drawing._id.toString());
        if(!access) throw new HttpException('L\'utilisateur n\a pas acces', HttpStatus.UNAUTHORIZED);
        return {
            drawingName:drawing.drawingName, 
            isPublic: drawing.isPublic,
            isPasswordProtected: drawing.isPasswordProtected,
            owner: drawing.owner.toString(),
            creationDate: drawing.creationDate,
            albumID: drawing.album._id.toString(),
            isExposed: drawing.isExposed
        };
    }

    @Get('allDrawingsContributed')
    async getAllDrawingAccessible(@Request() req){
        const allRooms = await this.drawingsService.getAllContributedDrawingForUser(req.user._id);
        return allRooms;
    }

    @Get('allDrawingsContributed2')
    async getAllDrawingAccessible2(@Request() req){
        const allRooms = await this.drawingsService.getAllContributedDrawingForUser2(req.user._id);
        return allRooms;
    }

    @Get('allDrawingOwnByUser')
    async getAllDrawingOwnByUser(@Request() req){
        const allRooms = await this.drawingsService.allDrawingOwnByUser(req.user._id);
        return allRooms;
    }

    @Get('userIsOwnerOfDrawing/:drawingID')
    async userIsOwner(@Request() req, @Param() selectDrawingIDDto: SelectDrawingIDDto){
        const access = await this.drawingsService.userIsOwnerOfDrawing(req.user._id, selectDrawingIDDto.drawingID);
        return access;
    }
    

    @Get('allCommandsInDrawing/:drawingID')
    async getAllCommandInDrawing(@Request() req, @Param() selectDrawingIDDto: SelectDrawingIDDto){
        const access = await this.drawingsService.userHasAccessToDrawing(req.user._id, selectDrawingIDDto.drawingID);
        if(!access) throw new HttpException('L\'utilisateur n\a pas acces', HttpStatus.UNAUTHORIZED);
        const message = await this.drawingsService.getAllCommandsInDrawing(selectDrawingIDDto.drawingID);
        return message;
    }

    @Get('allMessagesInDrawing/:drawingID')
    async getAllMessageInRoom(@Request() req, @Param() selectDrawingIDDto: SelectDrawingIDDto){
        const access = await this.drawingsService.userHasAccessToDrawing(req.user._id, selectDrawingIDDto.drawingID);
        if(!access) throw new HttpException('L\'utilisateur n\a pas acces', HttpStatus.UNAUTHORIZED);
        const message = await this.drawingsService.getAllMessagesInDrawing(selectDrawingIDDto.drawingID);
        return message;
    }

    @Get('allCommandsFromClient')
    async getAllCommandsFromClient(@Request() req,){
        const result = await this.drawingsService.allCommandToClient(req.user._id);
        return result;
    }

    @Get('recentDrawingEdited')
    async getRecentDrawingEdited(@Request() req,){
        const result = await this.drawingsService.recentDrawingEdited(req.user._id);
        return result;
    }

    @Get('connectedUserInDrawing/:drawingID')
    async getAllConnectedUserInDrawing(@Request() req, @Param() selectDrawingIDDto: SelectDrawingIDDto){
        const access = await this.drawingsService.userHasAccessToDrawing(req.user._id, selectDrawingIDDto.drawingID);
        if(!access) throw new HttpException('L\'utilisateur n\a pas acces', HttpStatus.UNAUTHORIZED);
        const connected_user = await this.drawingRealTimeService.getConnectedUserInDrawing(selectDrawingIDDto.drawingID);
        return connected_user;
    }

    @Get('selectedCommandInDrawing/:drawingID')
    async getAllSelectedCommandInDrawing(@Request() req, @Param() selectDrawingIDDto: SelectDrawingIDDto){
        const access = await this.drawingsService.userHasAccessToDrawing(req.user._id, selectDrawingIDDto.drawingID);
        if(!access) throw new HttpException('L\'utilisateur n\a pas acces', HttpStatus.UNAUTHORIZED);
        const selectedCommand = await this.drawingRealTimeService.getSelectedCommandInDrawing(selectDrawingIDDto.drawingID);
        return selectedCommand;
    }

    @Post('changePassword')
    async changePassword(@Body() changePasswordDrawingDto: ChangePasswordDrawingDto, @Request() req){
        const result = await this.drawingsService.changeDrawingPassword(changePasswordDrawingDto.drawingID, req.user._id, changePasswordDrawingDto.password);
        if(!result) throw new HttpException('Le mot de passe n\'a pas été modifié', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('changeProtection')
    async changeProtection(@Body() changeProtectioNDrawingDto: ChangeProtectioNDrawingDto, @Request() req){
        const result = await this.drawingsService.changeProtectionDrawing(changeProtectioNDrawingDto.drawingID, req.user._id, changeProtectioNDrawingDto.password);
        if(!result) throw new HttpException('Le mot de passe n\'a pas été modifié', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('changeDrawingName')
    async changeDrawingName(@Body() changeNameDrawingDto: ChangeNameDrawingDto, @Request() req){
        const result = await this.drawingsService.changeDrawingName(changeNameDrawingDto.drawingID, req.user._id, changeNameDrawingDto.name);
        if(!result) throw new HttpException('Le mot de passe n\'a pas été modifié', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('changeDrawingExposition')
    async changeDrawingExposition(@Body() changeDrawingExposition: ChangeDrawingExpositionDto, @Request() req){
        const result = await this.drawingsService.changeDrawingExposition(changeDrawingExposition.drawingID, req.user._id);
        if(!result) throw new HttpException('L\'exposition n\'a pas été modifié', HttpStatus.NOT_ACCEPTABLE);
    }

    @Post('verifyPasswordDrawing')
    async verifyPasswordDrawing(@Body() veryfiPasswordDrawing: VerifyPasswordDrawingDto, @Request() req){
        const result = await this.drawingsService.isPasswordOk(veryfiPasswordDrawing.drawingID, req.user._id, veryfiPasswordDrawing.password);
        return result;
    }


}
