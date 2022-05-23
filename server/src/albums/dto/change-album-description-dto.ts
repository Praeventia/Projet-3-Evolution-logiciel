import { IsString, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';
import { MAX_ALBUM_DESCRIPTION } from 'src/const';

export class ChangeAlbumDescriptionDto {
    @IsNotEmpty()
    @MaxLength(MAX_ALBUM_DESCRIPTION)
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsMongoId()
    albumID: string;
}