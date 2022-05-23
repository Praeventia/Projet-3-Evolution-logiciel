import { DrawEllipseData } from '@app/classes/commands/data/draw-ellipse-data';
import { DrawPencilData } from '@app/classes/commands/data/draw-pencil-data';
import { DrawRectangleData } from '@app/classes/commands/data/draw-rectangle-data';

export interface Command {
    commandData: DrawEllipseData | DrawRectangleData | DrawPencilData;
    do(ctx: CanvasRenderingContext2D): void | Promise<void>;
}
