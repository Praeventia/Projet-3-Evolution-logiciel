import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { badrequestDrawing, DrawingInfo, DRAWING_EXCEPTION, unauthorizedDrawing} from 'src/const';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { DrawingRealTimeService } from '../drawings-real-time.service';
import { DrawingsService } from '../drawings.service';


@Injectable()
export class DrawingGuard implements CanActivate {

    constructor(private readonly drawingsService: DrawingsService, private authService: AuthService, private readonly drawingRealTimeService: DrawingRealTimeService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToHttp().getRequest();
        const tokenname=client.handshake?.query?.Authorization as string;
        const drawingID=client.handshake?.query?.drawingID as string;
        const password=client.handshake?.query?.password as string;
        const userdata: UserClientSide | undefined=await this.authService.isUserConnected(tokenname);
        if (userdata == null){
            //le user nexiste pas
            try{
                client?.emit(DRAWING_EXCEPTION, unauthorizedDrawing);
                client?.disconnect();
            }catch(error: any){
                throw new WsException('Client is not a socket');
            }finally{
                return false;
            }
        }
        const access: boolean = await this.drawingsService.authorizeToSendDrawingCommand(drawingID, tokenname, password);
        if(!access){
            //le user na pas le droit denvoyer de dessin
            try{
                client?.emit(DRAWING_EXCEPTION, badrequestDrawing);
                client?.disconnect();
                this.drawingRealTimeService.disconnectUser(userdata._id.toString());
            }catch(error: any){
                throw new WsException('Client is not a socket');
            }finally{
                return false;
            }
        }
        const info: DrawingInfo = {userdata: userdata, drawingID: drawingID};
        client.info = info;
        return true;
    }
}