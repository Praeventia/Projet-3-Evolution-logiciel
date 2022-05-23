import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class ChangePasswordDrawingDto {
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;
}