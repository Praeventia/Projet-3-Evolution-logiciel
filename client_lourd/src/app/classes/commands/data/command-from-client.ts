import { DrawEllipseData } from '@app/classes/commands/data/draw-ellipse-data';
import { DrawPencilData } from '@app/classes/commands/data/draw-pencil-data';
import { DrawRectangleData } from '@app/classes/commands/data/draw-rectangle-data';
import { ToolType } from '@app/tool-type';

export class CommandFromClient {
    tool: ToolType;
    commandData: DrawEllipseData | DrawPencilData | DrawRectangleData;
}
