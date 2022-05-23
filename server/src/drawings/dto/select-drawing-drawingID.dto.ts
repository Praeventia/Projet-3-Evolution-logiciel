import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SelectDrawingIDDto {
    @IsNotEmpty()
    @IsMongoId()
    drawingID: string;
}