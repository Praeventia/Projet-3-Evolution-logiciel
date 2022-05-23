import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Album, AlbumSchema } from './schema/album.schema';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { UsersModule } from 'src/users/users.module';
import { DrawingsModule } from 'src/drawings/drawings.module';

@Module({
    imports: [DrawingsModule, UsersModule, MongooseModule.forFeature([{name: Album.name, schema: AlbumSchema}])],
    providers: [AlbumsService],
    exports: [AlbumsService],
    controllers: [AlbumsController],
})
export class AlbumsModule {}
