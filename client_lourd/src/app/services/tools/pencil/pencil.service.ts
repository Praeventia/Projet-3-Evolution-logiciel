import { Injectable } from '@angular/core';
import { CommandFromClient } from '@app/classes/commands/data/command-from-client';
import { DrawPencilData } from '@app/classes/commands/data/draw-pencil-data';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { LINE, MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    pathData: Vec2[];

    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected commandsService: CommandsService,
        protected selectionService: SelectionService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, commandsService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    async onMouseUp(event: MouseEvent): Promise<void> {
        if (this.mouseDown && event.button === MouseButton.Left) {
            this.mouseDown = false;
            const pencilCommandData: DrawPencilData = {
                pathData: this.pathData,
                color: this.colorService.primaryColor.hsla(),
                size: this.toolsInfoService.getSizeOf(ToolType.pencil),
            };
            const commandToServer: CommandFromClient = { tool: ToolType.pencil, commandData: pencilCommandData };
            const response = await this.commandsService.sendCommandToServer(commandToServer);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.changingToolsService.currentTool = ToolType.selection;
            await this.selectionService.selectCommand(response._id);
            this.clearPath();
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event, this.left, this.top);
            this.pathData.push(mousePosition);
            this.drawPreview();
        }
    }

    clearPath(): void {
        this.pathData = [];
    }

    drawPreview(): void {
        const length = this.pathData.length;
        const ctx = this.drawingService.previewCtx;
        ctx.setLineDash(LINE);
        ctx.strokeStyle = this.colorService.primaryColor.hsla();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.toolsInfoService.getSizeOf(ToolType.pencil);
        ctx.beginPath();
        if (length > 2) {
            ctx.moveTo(this.pathData[length - 2].x, this.pathData[length - 2].y);
        }
        ctx.lineTo(this.pathData[length - 1].x, this.pathData[length - 1].y);
        ctx.stroke();
    }
}
