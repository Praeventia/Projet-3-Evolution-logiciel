import { Injectable } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { Vec2 } from './vec2';

// tslint:disable:no-empty
@Injectable({
    providedIn: 'root',
})
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;

    top: number = 0;
    left: number = 0;

    constructor(
        protected drawingService: DrawingService,
        protected toolsInfoService: ToolsInfoService,
        protected changingToolsService: ChangingToolsService,
        protected commandsService: CommandsService,
    ) {
        this.changingToolsService.getToolChanged().subscribe(() => {
            this.clearPath();
            this.mouseDown = false;
        });

        this.toolsInfoService.getNewDrawing().subscribe(() => {
            this.clearPath();
            this.mouseDown = false;
        });
    }

    onMouseDown(event: MouseEvent): void {}

    onMouseDoubleClick(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseMoveWindow(event: MouseEvent): void {}

    onMouseLeave(event: MouseEvent): void {}

    onMouseEnter(event: MouseEvent): void {}

    onWheelEvent(event: WheelEvent): void {}

    onKeyDownEscape(): void {}

    onKeyDownBackSpace(): void {}

    onKeyDownShift(): void {}

    onKeyUpShift(): void {}

    onKeyDownEnter(): void {}

    onKeyDownDelete(): void {}

    onKeyDownUpArrow(): void {}

    onKeyDownDownArrow(): void {}

    onKeyDownLeftArrow(): void {}

    onKeyDownRightArrow(): void {}

    onKeyUpUpArrow(): void {}

    onKeyUpDownArrow(): void {}

    onKeyUpLeftArrow(): void {}

    onKeyUpRightArrow(): void {}

    getPositionFromMouse(event: MouseEvent, left: number, top: number): Vec2 {
        return { x: event.clientX - left, y: event.clientY - top };
    }

    setLeftAndTopOffsets(left: number, top: number): void {
        this.top = top;
        this.left = left;
    }

    clearPath(): void {}
}
