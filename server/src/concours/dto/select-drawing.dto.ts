import { IsMongoId } from 'class-validator';

export class SelectDrawingDto{
    @IsMongoId()
    drawingID: string;
}