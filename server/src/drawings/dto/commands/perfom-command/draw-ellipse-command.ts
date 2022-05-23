// tslint:disable: prefer-for-of

import { LINE, PERIMETER_STROKE_SIZE, DASH, LINE_DASH_OFFSET, PADDING, BIGGEST_LETTER, INTERLINE } from 'src/const';
import { DrawEllipseData } from '../data/draw-ellipse-data';
import { Vec2 } from '../vec2';
import { PerformCommand } from './performCommand';


export class DrawEllipseCommand implements PerformCommand {
    commandData: DrawEllipseData;

    constructor(drawEllipseData: DrawEllipseData) {
        this.commandData = drawEllipseData;
    }

    do(ctx: CanvasRenderingContext2D): void {
        const offSet = {
            x: this.commandData.end.x - this.commandData.beginning.x,
            y: this.commandData.end.y - this.commandData.beginning.y,
        };
        if (this.commandData.isEven) {
            const chosenSide = Math.min(Math.abs(offSet.x), Math.abs(offSet.y));
            offSet.x = chosenSide * Math.sign(offSet.x);
            offSet.y = chosenSide * Math.sign(offSet.y);
        }
        const radius = { x: Math.abs(offSet.x / 2), y: Math.abs(offSet.y / 2) };
        const center: Vec2 = {
            x: this.commandData.beginning.x + radius.x * Math.sign(offSet.x),
            y: this.commandData.beginning.y + radius.y * Math.sign(offSet.y),
        };

        ctx.fillStyle = this.commandData.fillColor;
        ctx.strokeStyle = this.commandData.strokeColor;
        ctx.lineJoin = 'miter';
        ctx.setLineDash(LINE);

        const halfSize = this.commandData.size / 2;
        radius.x -= halfSize;
        radius.y -= halfSize;
        if (radius.x < halfSize) radius.x = halfSize;

        if (radius.y < halfSize) radius.y = halfSize;

        if (Math.abs(offSet.x) < 2 * this.commandData.size) {
            offSet.x = 2 * this.commandData.size * Math.sign(offSet.x);
            center.x = this.commandData.beginning.x + this.commandData.size * Math.sign(offSet.x);
        }
        if (Math.abs(offSet.y) < 2 * this.commandData.size) {
            offSet.y = 2 * this.commandData.size * Math.sign(offSet.y);
            center.y = this.commandData.beginning.y + this.commandData.size * Math.sign(offSet.y);
        }

        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, 2 * Math.PI);

        if (this.commandData.fillColor !== 'clear') {
            ctx.fill();
        }

        ctx.lineWidth = this.commandData.size;
        ctx.stroke();

        if (this.commandData.drawPreview) this.drawPreviewContour(ctx, offSet);
        this.drawText(ctx);
    }

    drawPreviewContour(ctx: CanvasRenderingContext2D, offSet: Vec2): void {
        ctx.lineWidth = PERIMETER_STROKE_SIZE;
        ctx.lineDashOffset = 0;
        ctx.setLineDash(DASH);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.commandData.beginning.x, this.commandData.beginning.y, offSet.x, offSet.y);
        ctx.lineDashOffset = LINE_DASH_OFFSET;
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.commandData.beginning.x, this.commandData.beginning.y, offSet.x, offSet.y);
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
