import { IsString, IsNotEmpty, MaxLength, IsMongoId} from 'class-validator';
import { MAX_ALBUM_NAME } from 'src/const';

export class ChangeAlbumNameDto {
    @IsNotEmpty()
    @MaxLength(MAX_ALBUM_NAME)
    @IsString()
    albumName: string;

    @IsNotEmpty()
    @IsMongoId()
    albumID: string;
}