import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { MAX_ROOM_NAME } from 'src/const';

export class AccessRoomDto {
    @IsNotEmpty()
    @MaxLength(MAX_ROOM_NAME)
    @IsString()
    roomName: string;
}