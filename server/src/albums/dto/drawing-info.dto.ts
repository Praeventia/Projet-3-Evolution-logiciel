import {IsNotEmpty, IsMongoId } from 'class-validator';

export class DrawingInfoDto {
    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;
}