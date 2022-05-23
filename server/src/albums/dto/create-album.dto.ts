import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { MAX_ALBUM_DESCRIPTION, MAX_ALBUM_NAME } from 'src/const';

export class CreateAlbumDto {
    @IsNotEmpty()
    @MaxLength(MAX_ALBUM_NAME)
    @IsString()
    albumName: string;

    @IsNotEmpty()
    @MaxLength(MAX_ALBUM_DESCRIPTION)
    @IsString()
    description: string;
}