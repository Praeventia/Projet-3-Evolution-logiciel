import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class JoinPrivateAlbumDto {
    @IsNotEmpty()
    @IsString({})
    userIDToAdd: string;

    @IsNotEmpty()
    @IsMongoId()
    albumID: string;
}