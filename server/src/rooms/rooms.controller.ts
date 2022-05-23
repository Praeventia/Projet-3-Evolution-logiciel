import { Body, Controller, Request, Get, HttpException, HttpStatus, Put, UseGuards, Post, Param} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessRoomDto } from './dto/access-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {

    constructor(private readonly roomsService: RoomsService) {}
    
    @Get('allRooms')
    async getAllRoom(){
        const allRooms = await this.roomsService.getAllRooms();
        return allRooms;
    }

    @Get('allRoomsJoin')
    async getAllRoomAccessible(@Request() req){
        const allRooms = await this.roomsService.getAllRoomsForUser(req.user._id);
        return allRooms;
    }

    @Get('allMessagesInRoom/:roomName')
    async getAllMessageInRoom(@Request() req, @Param() accessRoomDto: AccessRoomDto){
        const access = await this.roomsService.userHasAccessToRoom(req.user._id, accessRoomDto.roomName);
        if(!access) throw new HttpException('L\'utilisateur n\a pas acces', HttpStatus.UNAUTHORIZED);
        const message = await this.roomsService.getAllMessagesInRoom(accessRoomDto.roomName);
        return message;
    }

    @Put('createRoom')
    async createRoom(@Body() accessRoomDto: AccessRoomDto, @Request() req){
        const result = await this.roomsService.createRoom(accessRoomDto.roomName, req.user._id);
        if(!result) throw new HttpException('Le canal n\'a pas été créé', HttpStatus.NOT_ACCEPTABLE);
    }

    @Put('addUserToRoom')
    async addUserToRoom(@Body() accessRoomDto: AccessRoomDto, @Request() req){
        const result = await this.roomsService.addUserToRoom(accessRoomDto.roomName, req.user._id); 
        if(!result) throw new HttpException('L\'utilisateur n\'a pas été rajouté', HttpStatus.BAD_REQUEST);
    
    }

    @Post('removeUserFromRoom')
    async removeUserFromRoom(@Body() accessRoomDto: AccessRoomDto, @Request() req){
        const result = await this.roomsService.removeUserFromRoom(accessRoomDto.roomName, req.user._id); 
        if(!result) throw new HttpException('L\'utilisateur n\'a pas été supprimé', HttpStatus.BAD_REQUEST);    
    }

    @Post('deleteRoom')
    async deleteRoom(@Body() accessRoomDto: AccessRoomDto, @Request() req){
        const result = await this.roomsService.deleteRoom(accessRoomDto.roomName, req.user._id);
        if(!result) throw new HttpException('Le canal n\'a pas été supprimé', HttpStatus.BAD_REQUEST);    
    }

}
