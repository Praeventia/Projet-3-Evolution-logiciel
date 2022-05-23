import { Command } from '@app/classes/commands/command';
import { LINE } from '@app/const';
import { DrawPencilData } from './data/draw-pencil-data';

export class DrawPencilCommand implements Command {
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
