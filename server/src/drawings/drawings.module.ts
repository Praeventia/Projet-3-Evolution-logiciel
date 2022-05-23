import { Module } from '@nestjs/common';
import { DrawingsService } from './drawings.service';
import { DrawingsGateway } from './drawings.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Command, CommandSchema, Drawing, DrawingSchema } from './schema/drawing.schema';
import { UsersModule } from 'src/users/users.module';
import { DrawingsController } from './drawings.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { DRAWING_FOLDER } from 'src/const';
import { DrawingRealTimeService } from './drawings-real-time.service';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ConcoursEntry, ConcoursEntrySchema } from 'src/concours/schema/concours-entry.schema';

@Module({
    imports: [
        MulterModule.register({dest: DRAWING_FOLDER}),
        AuthModule,
        MongooseModule.forFeature([{name: Drawing.name, schema: DrawingSchema}]),
        MongooseModule.forFeature([{name: Command.name, schema: CommandSchema}]),
        MongooseModule.forFeature([{name: ConcoursEntry.name, schema: ConcoursEntrySchema}]),  
        UsersModule,
        RoomsModule
    ],
    providers: [DrawingsService, DrawingsGateway, DrawingRealTimeService],
    controllers: [DrawingsController],
    exports: [DrawingsService, DrawingRealTimeService]
})
export class DrawingsModule {}
