import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class VerifyPasswordDrawingDto {
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;
}