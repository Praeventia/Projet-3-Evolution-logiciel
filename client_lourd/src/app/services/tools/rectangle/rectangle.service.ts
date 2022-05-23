import { Injectable } from '@angular/core';
import { AbstractShape } from '@app/classes/abstract-shape';
import { CommandFromClient } from '@app/classes/commands/data/command-from-client';
import { DrawRectangleData } from '@app/classes/commands/data/draw-rectangle-data';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
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
export class RectangleService extends AbstractShape {
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected commandsService: CommandsService,
        protected selectionService: SelectionService,
    ) {
        super(drawingService, colorService, toolsInfoService, changingToolsService, commandsService, selectionService);
    }

    getCommandData(): DrawRectangleData {
        const begin = { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y };
        const ending = { x: this.lastMousePos.x, y: this.lastMousePos.y };
        if (ending.x < begin.x) {
            begin.x = this.lastMousePos.x;
            ending.x = this.mouseDownCoord.x;
        }
        if (ending.y < begin.y) {
            begin.y = this.lastMousePos.y;
            ending.y = this.mouseDownCoord.y;
        }
        return {
            strokeColor: this.colorService.primaryColor.hsla(),
            fillColor: this.colorService.secondaryColor.hsla(),
            size: this.toolsInfoService.getSizeOf(ToolType.rectangle),
            withStroke: true,
            withFill: true,
            beginning: begin,
            end: ending,
            isEven: this.isEven,
            text: '',
            textColor: this.colorService.textColor.hsla(),
        };
    }

    async drawShape(): Promise<void> {
        const rectCommandData = this.getCommandData();
        const commandToServer: CommandFromClient = { tool: ToolType.rectangle, commandData: rectCommandData };
        const response = await this.commandsService.sendCommandToServer(commandToServer);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.changingToolsService.currentTool = ToolType.selection;
        await this.selectionService.selectCommand(response._id);
    }

    drawPreview(): void {
        const commandData = this.getCommandData();
        const command = new DrawRectangleCommand(commandData);
        command.do(this.drawingService.previewCtx);
    }
}
