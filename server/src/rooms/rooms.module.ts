import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsService } from './rooms.service';
import { Message, MessageSchema, Room, RoomSchema } from './schema/rooms.schema';
import { RoomsController } from './rooms.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [UsersModule,
        MongooseModule.forFeature([{name: Room.name, schema: RoomSchema}]),
        MongooseModule.forFeature([{name: Message.name, schema: MessageSchema}])],
    providers: [RoomsService],
    exports: [RoomsService],
    controllers: [RoomsController]
})
export class RoomsModule {}
