// tslint:disable: prefer-for-of

import { LINE, PADDING, BIGGEST_LETTER, INTERLINE } from 'src/const';
import { DrawRectangleData } from '../data/draw-rectangle-data';
import { Vec2 } from '../vec2';
import { PerformCommand } from './performCommand';


export class DrawRectangleCommand implements PerformCommand {
    commandData: DrawRectangleData;

    constructor(drawRectangleData: DrawRectangleData) {
        this.commandData = drawRectangleData;
    }

    do(ctx: CanvasRenderingContext2D): void {
        const dimension: Vec2 = {
            x: this.commandData.end.x - this.commandData.beginning.x,
            y: this.commandData.end.y - this.commandData.beginning.y,
        };
        if (Math.abs(dimension.x) < Math.abs(this.commandData.size * 2)) {
            dimension.x = this.commandData.size * 2 * Math.sign(dimension.x);
        }
        if (Math.abs(dimension.y) < Math.abs(this.commandData.size * 2)) {
            dimension.y = this.commandData.size * 2 * Math.sign(dimension.y);
        }
        if (this.commandData.isEven) {
            const chosenSide = Math.min(Math.abs(dimension.x), Math.abs(dimension.y));
            dimension.x = chosenSide * Math.sign(dimension.x);
            dimension.y = chosenSide * Math.sign(dimension.y);
        }

        ctx.fillStyle = this.commandData.fillColor;
        ctx.strokeStyle = this.commandData.strokeColor;
        ctx.lineJoin = 'miter';
        ctx.setLineDash(LINE);

        if (this.commandData.fillColor !== 'clear') {
            ctx.fillRect(this.commandData.beginning.x, this.commandData.beginning.y, dimension.x, dimension.y);
        }
        let offSetX = this.commandData.size / 2;
        let offSetY = this.commandData.size / 2;
        if (this.commandData.end.x < this.commandData.beginning.x) {
            offSetX = -offSetX;
        }
        if (this.commandData.end.y < this.commandData.beginning.y) {
            offSetY = -offSetY;
        }
        ctx.lineWidth = this.commandData.size;
        ctx.strokeRect(
            this.commandData.beginning.x + offSetX,
            this.commandData.beginning.y + offSetY,
            dimension.x - 2 * offSetX,
            dimension.y - 2 * offSetY,
        );
        this.drawText(ctx);
    }

    drawText(ctx: CanvasRenderingContext2D): void {
        if (this.commandData.text !== undefined && this.commandData.text !== '') {
            const startPos: Vec2 = { x: this.commandData.beginning.x, y: this.commandData.beginning.y };
            const shapeWidth = this.commandData.end.x - this.commandData.beginning.x;
            startPos.x += shapeWidth / 2;
            startPos.y += PADDING;

            ctx.fillStyle = this.commandData.textColor;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';

            const textLines: string[] = [];
            let textLine = '';
            for (let i = 0; i < this.commandData.text.length; i++) {
                if (ctx.measureText(textLine).width + 2 * PADDING >= shapeWidth) {
                    textLines.push(textLine);
                    textLine = '';
                }
                textLine += this.commandData.text[i];
            }
            textLines.push(textLine);
            const metrics = ctx.measureText(BIGGEST_LETTER);
            const lineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            for (let i = 0; i < textLines.length; i++) {
                ctx.fillText(textLines[i], startPos.x, startPos.y + (i + 1) * (lineHeight + INTERLINE));
            }
        }
    }
}
