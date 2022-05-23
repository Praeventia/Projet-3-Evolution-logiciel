import { DrawEllipseData } from '../data/draw-ellipse-data';
import { DrawPencilData } from '../data/draw-pencil-data';
import { DrawRectangleData } from '../data/draw-rectangle-data';


export interface PerformCommand {
    commandData: DrawEllipseData | DrawRectangleData | DrawPencilData;
    do(ctx: CanvasRenderingContext2D): void | Promise<void>;
}
