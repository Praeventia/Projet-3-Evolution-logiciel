import { IsString, MaxLength, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { MAX_DRAWING_NAME } from 'src/const';

export class CreateDrawingDto {
    @IsNotEmpty()
    @MaxLength(MAX_DRAWING_NAME)
    @IsString({})
    drawingName: string;

    @IsNotEmpty()
    @IsMongoId()
    albumID: string;

    @IsString()
    @IsOptional()
    password:string
}