import { IsNotEmpty, IsNumber } from 'class-validator';
import { DrawEllipseData } from '../commands/data/draw-ellipse-data';
import { DrawPencilData } from '../commands/data/draw-pencil-data';
import { DrawRectangleData } from '../commands/data/draw-rectangle-data';

import { ToolType } from '../commands/tool-type';

export class CommandFromClientDto {
    @IsNumber()
    @IsNotEmpty()
    tool: ToolType;

    @IsNotEmpty()
    commandData: DrawEllipseData | DrawRectangleData | DrawPencilData;
}