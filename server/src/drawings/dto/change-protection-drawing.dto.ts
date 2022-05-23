import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class ChangeProtectioNDrawingDto {
    @IsOptional()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;
}