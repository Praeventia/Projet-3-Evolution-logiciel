// tslint:disable: max-file-line-count
// tslint:disable: prefer-for-of
import { Injectable } from '@angular/core';
import { DrawEllipseCommand } from '@app/classes/commands/draw-ellipse-command';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { BIGGEST_LETTER, NULL_COORD, NULL_INDEX, PADDING } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    lineIndex: number = NULL_INDEX;
    text: string[] = [];
    commandID: string = '';
    startPos: Vec2 = NULL_COORD;

    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected commandsService: CommandsService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, commandsService);
    }

    keyDown(event: KeyboardEvent): void {
        if (event.key.length > 1) return;
        this.setStartPos();
        const currentWidth = this.drawingService.previewCtx.measureText(this.text[this.lineIndex]).width;
        if (currentWidth + 2 * PADDING >= this.getMaxWidth()) {
            this.lineIndex++;
            this.text[this.lineIndex] = '';
        }
        this.text[this.lineIndex] += event.key;
        this.confirmText();
    }

    backspace(): void {
        if (this.text.length !== 0) {
            if (this.text[this.lineIndex].length === 0 && this.lineIndex > 0) {
                this.lineIndex--;
            }
            this.text[this.lineIndex] = this.text[this.lineIndex].substring(0, this.text[this.lineIndex].length - 1);
            this.confirmText();
        }
    }

    confirmText(): void {
        let fullText = '';
        for (let i = 0; i < this.text.length; i++) {
            fullText += this.text[i];
        }
        const command = this.commandsService.getCommandFromID(this.commandID);
        if (command instanceof DrawRectangleCommand || command instanceof DrawEllipseCommand) {
            command.commandData.text = fullText;
        }
    }

    clear(): void {
        this.text = [];
        this.lineIndex = NULL_INDEX;
        this.commandID = '';
        this.startPos = NULL_COORD;
    }

    getLineHeight(): number {
        const metrics = this.drawingService.previewCtx.measureText(BIGGEST_LETTER);
        return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }

    getMaxWidth(): number {
        const command = this.commandsService.getCommandFromID(this.commandID);
        if (command instanceof DrawRectangleCommand || command instanceof DrawEllipseCommand) {
            const maxWidth = command.commandData.end.x - command.commandData.beginning.x - PADDING;
            return maxWidth;
        }
        return NULL_INDEX;
    }

    setStartPos(): void {
        const command = this.commandsService.getCommandFromID(this.commandID);
        if (command instanceof DrawRectangleCommand || command instanceof DrawEllipseCommand) {
            this.startPos = { ...command.commandData.beginning };
            const shapeWidth = command.commandData.end.x - command.commandData.beginning.x;
            this.startPos.x += shapeWidth / 2;
            this.startPos.y += PADDING;
        }
    }

    textToLines(text: string, shapeWidth: number): void {
        this.drawingService.previewCtx.fillStyle = this.colorService.textColor.hsla();
        this.drawingService.previewCtx.font = '20px Arial';
        this.drawingService.previewCtx.textAlign = 'center';
        this.text = [];
        let textLine = '';
        for (let i = 0; i < text.length; i++) {
            if (this.drawingService.previewCtx.measureText(textLine).width + 2 * PADDING >= shapeWidth) {
                this.text.push(textLine);
                textLine = '';
            }
            textLine += text[i];
        }
        this.text.push(textLine);
        this.lineIndex = this.text.length - 1;
    }
}
