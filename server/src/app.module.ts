import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsModule } from './rooms/rooms.module';
import { ConnexionController } from './connexion/connexion.controller';
import { DrawingsModule } from './drawings/drawings.module';
import { AlbumsModule } from './albums/albums.module';
import { ConnexionService } from './connexion/connexion.service';
import { ConcoursModule } from './concours/concours.module';
import { ScheduleModule } from '@nestjs/schedule';
//import { DATABASE_PASSWORD } from './const';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GifModule } from './gif/gif.module';
import { ImageGeneratorModule } from './image-generator/image-generator.module';
import { ImageModule } from './image/image.module';

//const DEV_DB = `mongodb+srv://admin:${DATABASE_PASSWORD}@cluster0.lre07.mongodb.net/pi3?retryWrites=true&w=majority`;
const DOCKER_DB = 'mongodb://db:27017/pi3';

@Module({
    imports: [AuthModule, UsersModule, ChatModule, MongooseModule.forRoot(DOCKER_DB), RoomsModule, DrawingsModule, AlbumsModule, ConcoursModule, ScheduleModule.forRoot(), LeaderboardModule, GifModule, ImageGeneratorModule, ImageModule],
    controllers: [ConnexionController],
    providers: [ConnexionService],
})
export class AppModule {}
