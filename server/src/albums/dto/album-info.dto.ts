import {IsNotEmpty, IsMongoId } from 'class-validator';

export class AlbumInfoDto {
    @IsNotEmpty()
    @IsMongoId()
    albumID: string;
}