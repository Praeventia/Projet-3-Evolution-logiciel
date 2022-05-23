import { LINE } from 'src/const';
import { DrawPencilData } from '../data/draw-pencil-data';
import { PerformCommand } from './performCommand';


export class DrawPencilCommand implements PerformCommand {
    commandData: DrawPencilData;

    constructor(drawPencilData: DrawPencilData) {
        this.commandData = drawPencilData;
    }

    do(ctx: CanvasRenderingContext2D): void {
        ctx.setLineDash(LINE);
        ctx.strokeStyle = this.commandData.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.commandData.size;
        ctx.beginPath();
        for (const point of this.commandData.pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}
