import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { CHAT_EXCEPTION, MAIN_ROOM, unauthorizedChat } from 'src/const';
import { RoomsService } from 'src/rooms/rooms.service';
import { UserClientSide } from 'src/users/schemas/users.schema';

@Injectable()
export class ChatGuard implements CanActivate {

    constructor(private readonly authService: AuthService, private readonly roomsService: RoomsService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToHttp().getRequest();
        const tokenname=client.handshake?.query?.Authorization as string;
        const userdata: UserClientSide | undefined=await this.authService.isUserConnected(tokenname);
        if (!userdata){
            try{
                client.emit(CHAT_EXCEPTION, unauthorizedChat);
                client.disconnect();
            }catch(error: any){
                throw new WsException('Client is not a socket');
            }
            return false;
        }
        let clientAccessToThisRoom: string [] = await this.roomsService.getAllRoomsForUser(userdata._id);
        if(clientAccessToThisRoom == null) clientAccessToThisRoom=[MAIN_ROOM];
        
        const info = {userdata: userdata, rooms: clientAccessToThisRoom};
        client.info = info;
        return true;
    }
}