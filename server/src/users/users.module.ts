import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AVATAR_FOLDER } from 'src/const';

@Module({
    imports: [MulterModule.register({dest: AVATAR_FOLDER}), MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
