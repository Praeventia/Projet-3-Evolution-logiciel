import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export abstract class AbstractShape extends Tool {
    isEven: boolean;

    lastMousePos: Vec2;
    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        protected changingToolsService: ChangingToolsService,
        protected commandsService: CommandsService,
        protected selectionService: SelectionService,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, commandsService);
        this.isEven = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
        }
    }

    async onMouseUp(event: MouseEvent): Promise<void> {
        if (this.mouseDown && event.button === MouseButton.Left) {
            this.mouseDown = false;
            const sameSpot = this.mouseDownCoord.x === this.lastMousePos.x && this.mouseDownCoord.y === this.lastMousePos.y;
            if (!sameSpot) {
                await this.drawShape();
            }
        }
        this.mouseDown = false;
    }

    onMouseMoveWindow(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event, this.left, this.top);
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPreview();
        }
    }

    onKeyDownShift(): void {
        this.isEven = true;
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPreview();
        }
    }

    onKeyUpShift(): void {
        this.isEven = false;
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPreview();
        }
    }

    onKeyDownEscape(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDown = false;
    }

    protected abstract drawShape(): Promise<void>;
    protected abstract drawPreview(): void;
}
