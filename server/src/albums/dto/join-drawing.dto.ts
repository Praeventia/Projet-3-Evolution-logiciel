import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class JoinDrawingDto {
    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;

    @IsOptional()
    @IsString()
    password: string;
}