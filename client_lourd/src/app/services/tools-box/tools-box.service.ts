import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolType } from '@app/tool-type';

@Injectable({
    providedIn: 'root',
})
export class ToolsBoxService {
    tools: Map<ToolType, Tool> = new Map();
    currentTool: Tool;

    constructor(
        private changingToolsService: ChangingToolsService,
        private pencilService: PencilService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private selectionService: SelectionService,
        private keyEventService: KeyEventService,
    ) {
        this.tools.set(ToolType.pencil, this.pencilService);
        this.tools.set(ToolType.rectangle, this.rectangleService);
        this.tools.set(ToolType.ellipse, this.ellipseService);
        this.tools.set(ToolType.selection, this.selectionService);

        this.changingToolsService.getToolChanged().subscribe(() => {
            const tool = this.changingToolsService.currentTool;
            switch (tool) {
                case ToolType.selection: {
                    this.onSelection(true);
                    break;
                }
                default: {
                    this.onSelection(false);
                }
            }
            this.currentTool = this.tools.get(tool) as Tool;
            keyEventService.currentTool = tool;
        });
        this.keyEventService.getMouseEvent('onMouseMove').subscribe((mouseEvent) => {
            this.currentTool.onMouseMove(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseMoveWindow').subscribe((mouseEvent) => {
            this.currentTool.onMouseMoveWindow(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseDown').subscribe((mouseEvent) => {
            this.currentTool.onMouseDown(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseUp').subscribe((mouseEvent) => {
            this.currentTool.onMouseUp(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseLeave').subscribe((mouseEvent) => {
            this.currentTool.onMouseLeave(mouseEvent);
        });
        this.keyEventService.getMouseEvent('onMouseEnter').subscribe((mouseEvent) => {
            this.currentTool.onMouseEnter(mouseEvent);
        });
        this.keyEventService.getKeyDownEvent('Backspace').subscribe(() => {
            this.currentTool.onKeyDownBackSpace();
        });
        this.keyEventService.getKeyDownEvent('Escape').subscribe(() => {
            this.currentTool.onKeyDownEscape();
        });
        this.keyEventService.getKeyDownEvent('Shift').subscribe(() => {
            this.currentTool.onKeyDownShift();
        });
        this.keyEventService.getKeyUpEvent('Shift').subscribe(() => {
            this.currentTool.onKeyUpShift();
        });
        this.keyEventService.getKeyDownEvent('Delete').subscribe(() => {
            this.currentTool.onKeyDownDelete();
        });
        this.keyEventService.getKeyDownEvent('ArrowUp').subscribe(() => {
            this.currentTool.onKeyDownUpArrow();
        });
        this.keyEventService.getKeyDownEvent('ArrowDown').subscribe(() => {
            this.currentTool.onKeyDownDownArrow();
        });
        this.keyEventService.getKeyDownEvent('ArrowLeft').subscribe(() => {
            this.currentTool.onKeyDownLeftArrow();
        });
        this.keyEventService.getKeyDownEvent('ArrowRight').subscribe(() => {
            this.currentTool.onKeyDownRightArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowUp').subscribe(() => {
            this.currentTool.onKeyUpUpArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowDown').subscribe(() => {
            this.currentTool.onKeyUpDownArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowLeft').subscribe(() => {
            this.currentTool.onKeyUpLeftArrow();
        });
        this.keyEventService.getKeyUpEvent('ArrowRight').subscribe(() => {
            this.currentTool.onKeyUpRightArrow();
        });

        this.keyEventService.getWheelEvent().subscribe((wheelEvent: WheelEvent) => {
            this.currentTool.onWheelEvent(wheelEvent);
        });
    }

    onSelection(isSelection: boolean): void {
        this.selectionService.isActive.next(isSelection);
    }
}
