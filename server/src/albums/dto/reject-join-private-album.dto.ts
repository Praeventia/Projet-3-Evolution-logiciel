import { IsString, IsNotEmpty } from 'class-validator';

export class RejectJoinPrivateAlbumDto {
    @IsNotEmpty()
    @IsString({})
    userIDToReject: string;

    @IsNotEmpty()
    @IsString()
    albumID: string;
}