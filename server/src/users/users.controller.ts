import { Param, Query, Res } from '@nestjs/common';
import { Body, Controller, Get, HttpException, HttpStatus, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor} from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { ALL_DEFAULT_AVATAR, AVATAR_FOLDER, AVATAR_SIZE_LIMIT, DEFAULT_AVATAR_FOLDER, MIME_TYPES} from 'src/const';
import { extname, join } from 'path';
import { NewUsernameDto } from './dto/new-username.dto';
import { SelectUserIDDto } from './dto/select-user-id.dto';
import { SelectAvatarUsernameDto } from './dto/select-avatar-username.dto';
import { SelectDefaultAvatarDto } from './dto/select-default-avatar.dto';

const imageFileFilter = (req, file, callback) => {
    if (!MIME_TYPES.includes(file.mimetype)) {
        return callback(new HttpException('Seulement les fichiers .jpg ou .png sont accepté', HttpStatus.NOT_ACCEPTABLE), false);
    }
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return callback(new HttpException('Seulement les fichiers .jpg ou .png sont accepté', HttpStatus.NOT_ACCEPTABLE), false);
    }
    callback(null, true);
};

const editFileNameAvatar = (req, file, callback) => {
    const userID = req.user._id.toString();
    const fileExtName = extname(file.originalname).toLowerCase();
    callback(null, `${userID}${fileExtName}`);
};

@Controller('users')
export class UsersController {
    
    constructor(private readonly usersService:UsersService) {}
    
    @UseGuards(JwtAuthGuard)
    @Get('userData')
    async getUserData(@Request() req){
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('userInfo/:id')
    async getUsernameFromID(@Param() selectUserIDDto:SelectUserIDDto){
        const user = await this.usersService.findOneByID(selectUserIDDto.id);
        if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        if(user.isEmailProtected) return {username: user.username, isEmailProtected:true};
        return {username: user.username, isEmailProtected:false, email:user.email};
    }

    @UseGuards(JwtAuthGuard)
    @Get('userLoginTime')
    async getLoginFromID(@Request() req){
        const user = await this.usersService.findOneByID(req.user._id);
        if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return user.allLoginDate;
    }

    @UseGuards(JwtAuthGuard)
    @Get('userDisconnectTime')
    async getDisconnectFromID(@Request() req){
        const user = await this.usersService.findOneByID(req.user._id);
        if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return user.allDisconnectDate;
    }

    @UseGuards(JwtAuthGuard)
    @Get('userTotalCollaborationTime')
    async getTotalCollaborationTime(@Request() req){
        const user = await this.usersService.findOneByID(req.user._id);
        if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return Math.floor(user.totalEditionTime);
    }

    @UseGuards(JwtAuthGuard)
    @Get('userAverageCollaborationTime')
    async getAverageCollaborationTime(@Request() req){
        const user = await this.usersService.findOneByID(req.user._id);
        if(user == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        if(user.timePerEdition.length === 0) return 0;
        const average = user.timePerEdition.reduce((previous: number, current:number) => previous+current) / user.timePerEdition.length;
        return Math.floor(average);
    }

    @UseGuards(JwtAuthGuard)
    @Get('numberOfMessageSentUser')
    async getNumberOfMessageSentUser(@Request() req){
        const number = await this.usersService.getNumberOfMessageSentUser(req.user._id);
        return number;
    }

    @UseGuards(JwtAuthGuard)
    @Get('numberOfPixelCrossUser')
    async getNumberOfPixelCrossUser(@Request() req){
        const number = await this.usersService.getNumberOfPixelCross(req.user._id);
        return number;
    }


    @UseGuards(JwtAuthGuard)
    @Put('changeUsername')
    async changeUsername(@Request() req, @Body() newUsernameDto:NewUsernameDto){
        const result = await this.usersService.changeUsername(req.user._id, newUsernameDto.username);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Put('changeEmailProtection')
    async changeEmailProtection(@Request() req){
        const result = await this.usersService.changeEmailProtection(req.user._id);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Put('changeAvatar')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: AVATAR_FOLDER,
            filename: editFileNameAvatar}),
        fileFilter: imageFileFilter,
        limits: {fileSize: AVATAR_SIZE_LIMIT*AVATAR_SIZE_LIMIT},
    }),
    )
    async changeAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
        if(file?.path == null) throw new HttpException('L\'avatar n\'a pas été changé', HttpStatus.NOT_ACCEPTABLE);
        const success = await this.usersService.changeAvatarPath(req.user._id, file.path);
        if(!success) throw new HttpException('L\'avatar n\'a pas été changé', HttpStatus.NOT_ACCEPTABLE);
    }

    @UseGuards(JwtAuthGuard)
    @Put('changeToDefaultAvatar')
    async changeDefaultAvatar(@Query('defaultAvatar') defaultAvatar, @Request() req) {
        if(defaultAvatar == null) throw new HttpException('Missing query parameter defaultAvatar', HttpStatus.NOT_ACCEPTABLE);
        if(!ALL_DEFAULT_AVATAR.includes(defaultAvatar)) throw new HttpException('Cet avatar n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const success = await this.usersService.changeAvatarPath(req.user._id, join(DEFAULT_AVATAR_FOLDER, defaultAvatar));
        if(!success) throw new HttpException('L\'avatar n\'a pas été changé', HttpStatus.NOT_ACCEPTABLE);
    }

    @Get('avatar/:username')
    async sendAvatar(@Param() selectAvatarUsernameDto:SelectAvatarUsernameDto, @Res() res) {
        const userID = await this.usersService.findOneByUsername(selectAvatarUsernameDto.username);
        if(userID == null) throw new HttpException('L\'utilisateur n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return res.sendFile(userID.avatarPath, { root: './' }); 
    }

    @Get('allDefaultAvatar')
    async allDefaultAvatar(){
        return ALL_DEFAULT_AVATAR;
    }

    @Get('defaultAvatar/:avatar')
    async sendDefaultAvatar(@Param() selectDefaultAvatarDto:SelectDefaultAvatarDto, @Res() res) {
        if(!ALL_DEFAULT_AVATAR.includes(selectDefaultAvatarDto.avatar)) throw new HttpException('Cet avatar n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return res.sendFile(selectDefaultAvatarDto.avatar, { root: DEFAULT_AVATAR_FOLDER }); 
    }
}
