import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
    imports: [AuthModule, RoomsModule],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],

})
export class ChatModule {}
