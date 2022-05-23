import { IsMongoId } from 'class-validator';

export class ChangeAlbumDrawingDto {
    @IsMongoId()
    albumID: string;

    @IsMongoId()
    drawingID: string;
}