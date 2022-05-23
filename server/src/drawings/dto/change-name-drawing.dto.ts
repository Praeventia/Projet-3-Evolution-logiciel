import { IsString, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';
import { MAX_DRAWING_NAME } from 'src/const';

export class ChangeNameDrawingDto {
    @IsNotEmpty()
    @MaxLength(MAX_DRAWING_NAME)
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;
}