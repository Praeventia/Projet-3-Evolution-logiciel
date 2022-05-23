// tslint:disable: max-file-line-count
// tslint:disable: no-any
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ColorHelper } from '@app/classes/color-helper';
import { Command } from '@app/classes/commands/command';
import { DrawEllipseCommand } from '@app/classes/commands/draw-ellipse-command';
import { DrawPencilCommand } from '@app/classes/commands/draw-pencil-command';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton, NULL_COORD, NULL_INDEX } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService, HiddenColour } from '@app/services/commands-service/commands.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { TextService } from '@app/services/text/text.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorInstance, ColorService } from '@app/services/tools/color/color.service';
import { BehaviorSubject, Observable } from 'rxjs';

export const TRANSLATION_VALUE = 3;

export type MirrorDirection = 'vertical' | 'horizontal';

export type Anchor = {
    TL: Vec2;
    BR: Vec2;
};

export const enum State {
    MOVE = 0,
    NW = 1,
    N = 2,
    NE = 3,
    W = 4,
    E = 5,
    SW = 6,
    S = 7,
    SE = 8,
    OFF = 9,
    IDLE = 10,
}

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool {
    // Current top left corner of the selection
    selectionPos: Vec2 = NULL_COORD;
    // Current position of the mouse
    lastMousePos: Vec2 = NULL_COORD;
    // Current position of the mouse
    offSet: Vec2 = NULL_COORD;
    // Current dimension of the selection (width, height)
    dimension: Vec2 = NULL_COORD;
    // original Dimension of selection
    ogDimension: Vec2 = NULL_COORD;
    // State of selection
    state: State;
    observableState: BehaviorSubject<State> = new BehaviorSubject<State>(State.OFF);
    // If a stroke is selected
    isActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Current selection anchors position
    anchors: Anchor;
    // If the selection has flipped during the resize and in which direction
    hasFlipped: Record<MirrorDirection, boolean>;

    functionMap: Map<State, () => void>;

    selectedCommand: Command = {} as Command;
    hiddenCommand: Command = {} as Command;
    commandIndex: number = NULL_INDEX;
    commandID: string = '';

    constructor(
        protected drawingService: DrawingService,
        protected colorService: ColorService,
        protected toolsInfoService: ToolsInfoService,
        changingToolsService: ChangingToolsService,
        protected commandsService: CommandsService,
        protected keyEventService: KeyEventService,
        protected textService: TextService,
        private router: Router,
    ) {
        super(drawingService, toolsInfoService, changingToolsService, commandsService);
        this.state = State.OFF;
        this.initFunctionMap();
        this.hasFlipped = {
            vertical: false,
            horizontal: false,
        };

        this.router.events.subscribe(() => {
            this.resetSelection();
        });
    }

    stateObserver(): Observable<State> {
        return this.observableState.asObservable();
    }

    async onMouseDown(event: MouseEvent): Promise<void> {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event, this.left, this.top);
            this.lastMousePos = this.mouseDownCoord;
            switch (this.state) {
                case State.OFF: {
                    this.extractCommand();
                    break;
                }
                case State.IDLE: {
                    if (this.insidePreview()) {
                        this.state = State.MOVE;
                        this.textService.confirmText();
                    } else {
                        await this.applyToBase();
                    }
                    break;
                }
                case State.MOVE: {
                    this.textService.confirmText();
                    break;
                }
                default: {
                    this.textService.confirmText();
                    if (this.selectedCommand instanceof DrawPencilCommand) {
                        this.drawingService.previewCtx.save();
                        this.ogDimension = { x: this.dimension.x, y: this.dimension.y };
                        if (this.selectedCommand instanceof DrawPencilCommand) {
                            this.arrangePath(this.selectedCommand);
                        }
                    }
                    break;
                }
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown || event.button !== MouseButton.Left) return;
        this.mouseDown = false;
        switch (this.state) {
            case State.OFF: {
                break;
            }
            case State.IDLE: {
                break;
            }
            case State.MOVE: {
                this.changeState(State.IDLE);
                this.setAnchors();
                break;
            }
            default: {
                this.changeState(State.IDLE);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                if (this.selectedCommand instanceof DrawPencilCommand) {
                    this.scalePencileStroke(this.selectedCommand);
                }
                this.placeBoundingBox(this.selectedCommand);
                this.selectedCommand.do(this.drawingService.previewCtx);
                this.setAnchors();
            }
        }
    }

    onMouseMoveWindow(event: MouseEvent): void {
        const oldMousePos = this.lastMousePos;
        this.lastMousePos = this.getPositionFromMouse(event, this.left, this.top);
        this.offSet = { x: this.lastMousePos.x - oldMousePos.x, y: this.lastMousePos.y - oldMousePos.y };
        switch (this.state) {
            case State.OFF: {
                break;
            }
            case State.IDLE: {
                break;
            }
            case State.MOVE: {
                if (this.mouseDown) {
                    this.moveSelection(this.selectedCommand, this.offSet);
                    this.setAnchors();
                }
                break;
            }
            default: {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                (this.functionMap.get(this.state) as () => void)();
                this.selectedCommand.do(this.drawingService.previewCtx);
                break;
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Backspace':
                this.onKeyDownBackSpace();
                return;
            case 'Escape':
                this.onKeyDownEscape();
                return;
            case 'Delete': {
                this.onKeyDownDelete();
                return;
            }
            default:
                this.onKeyDownChar(event);
                return;
        }
    }

    onKeyDownBackSpace(): void {
        this.textService.backspace();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectedCommand.do(this.drawingService.previewCtx);
    }

    async onKeyDownEscape(): Promise<void> {
        if (this.state !== State.OFF) {
            await this.applyToBase();
        }
    }

    async onKeyDownDelete(): Promise<void> {
        if (this.state !== State.OFF) {
            await this.commandsService.deleteCommand(this.commandID).then(() => {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.textService.clear();
                this.resetSelection();
            });
        }
    }

    onKeyDownChar(event: KeyboardEvent): void {
        if (
            this.state === State.IDLE &&
            event.key.length === 1 &&
            this.keyEventService.chatFocused === false &&
            (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand)
        ) {
            this.textService.keyDown(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectedCommand.do(this.drawingService.previewCtx);
        }
    }

    async extractCommand(): Promise<void> {
        const currentColour = this.drawingService.selectionCtx.getImageData(this.mouseDownCoord.x - 1, this.mouseDownCoord.y - 1, 1, 1).data;
        const hiddenColour = { r: currentColour[0], g: currentColour[1], b: currentColour[2] } as HiddenColour;
        if (currentColour[0] !== 0 && currentColour[1] !== 0 && currentColour[2] !== 0) {
            const index = this.commandsService.findCommandByColour(hiddenColour);
            if (index !== NULL_INDEX) {
                this.commandID = this.commandsService.commandIDs[index];
                await this.selectCommand(this.commandID);
            }
        }
    }

    async selectCommand(commandID: string): Promise<void> {
        if (commandID !== '') {
            await this.commandsService.selectCommand(commandID).then(async () => {
                if (this.commandsService.selectedID !== 'NULL') {
                    this.commandID = commandID;
                    const index = this.commandsService.findCommandByID(commandID);
                    this.selectedCommand = this.commandsService.commands[index];
                    this.hiddenCommand = this.commandsService.hiddenCommands[index];
                    if (this.selectedCommand instanceof DrawPencilCommand) {
                        await this.setColorInService(this.selectedCommand.commandData.color, ColorInstance.PRIMARY);
                    } else if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
                        await this.setColorInService(this.selectedCommand.commandData.strokeColor, ColorInstance.PRIMARY);
                        await this.setColorInService(this.selectedCommand.commandData.fillColor, ColorInstance.SECONDARY);
                        await this.setColorInService(this.selectedCommand.commandData.textColor, ColorInstance.TEXT);
                        this.textService.commandID = this.commandID;
                        const shapeWidth = this.selectedCommand.commandData.end.x - this.selectedCommand.commandData.beginning.x;
                        this.textService.textToLines(this.selectedCommand.commandData.text, shapeWidth);
                    }
                    this.colorService.colorInstance = ColorInstance.PRIMARY;
                    this.commandsService.reDrawAllExcept(this.commandID);
                    this.setAnchors();
                    this.placeBoundingBox(this.selectedCommand);
                    this.changeState(State.IDLE);
                    this.isActive.next(true);
                    this.selectedCommand.do(this.drawingService.previewCtx);
                }
            });
        }
    }

    async setColorInService(color: string, instance: ColorInstance): Promise<void> {
        this.colorService.colorInstance = instance;
        switch (instance) {
            case ColorInstance.PRIMARY: {
                this.colorService.primaryColor = ColorHelper.hsla2Color(color);
                break;
            }
            case ColorInstance.SECONDARY: {
                this.colorService.secondaryColor = ColorHelper.hsla2Color(color);
                break;
            }
            case ColorInstance.TEXT: {
                this.colorService.textColor = ColorHelper.hsla2Color(color);
                break;
            }
        }
    }

    moveSelection(command: Command, offSet: Vec2): void {
        this.selectionPos.x += offSet.x;
        this.selectionPos.y += offSet.y;
        if (command instanceof DrawPencilCommand) {
            for (const coord of command.commandData.pathData) {
                coord.x += offSet.x;
                coord.y += offSet.y;
            }
        } else if (command instanceof DrawRectangleCommand || command instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(command);
            commandData.beginning.x += offSet.x;
            commandData.beginning.y += offSet.y;
            commandData.end.x += offSet.x;
            commandData.end.y += offSet.y;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectedCommand.do(this.drawingService.previewCtx);
    }

    placeBoundingBox(command: Command): void {
        if (command instanceof DrawPencilCommand) {
            this.pencilBoundingBox(command);
        } else if (command instanceof DrawRectangleCommand || command instanceof DrawEllipseCommand) {
            this.shapeBoundingBox(command);
        }
        this.selectionPos = { x: this.anchors.TL.x, y: this.anchors.TL.y };
        this.dimension = { x: this.anchors.BR.x - this.anchors.TL.x, y: this.anchors.BR.y - this.anchors.TL.y };
    }

    pencilBoundingBox(command: DrawPencilCommand): void {
        const halfSize = command.commandData.size / 2;
        for (let i = 0; i < command.commandData.pathData.length; i++) {
            const coord = command.commandData.pathData[i];
            if (i === 0) {
                this.anchors = {
                    TL: { x: coord.x, y: coord.y },
                    BR: { x: coord.x, y: coord.y },
                };
            }
            if (this.anchors.TL.x >= coord.x - halfSize) {
                this.anchors.TL.x = coord.x - halfSize;
            }
            if (this.anchors.BR.x <= coord.x + halfSize) {
                this.anchors.BR.x = coord.x + halfSize;
            }
            if (this.anchors.TL.y >= coord.y - halfSize) {
                this.anchors.TL.y = coord.y - halfSize;
            }
            if (this.anchors.BR.y <= coord.y + halfSize) {
                this.anchors.BR.y = coord.y + halfSize;
            }
        }
    }

    shapeBoundingBox(command: DrawRectangleCommand | DrawEllipseCommand): void {
        const commandData = this.getCommandData(command);
        if (commandData.end.x > commandData.beginning.x) {
            this.anchors.TL.x = commandData.beginning.x;
            this.anchors.BR.x = commandData.end.x;
        } else {
            this.anchors.TL.x = commandData.end.x;
            this.anchors.BR.x = commandData.beginning.x;
        }
        if (commandData.end.y > commandData.beginning.y) {
            this.anchors.TL.y = commandData.beginning.y;
            this.anchors.BR.y = commandData.end.y;
        } else {
            this.anchors.TL.y = commandData.end.y;
            this.anchors.BR.y = commandData.beginning.y;
        }
    }

    getCommandData(command: DrawRectangleCommand | DrawEllipseCommand): any {
        let commandData = {} as any;
        if (command instanceof DrawRectangleCommand) {
            commandData = command.commandData;
        } else if (command instanceof DrawEllipseCommand) {
            commandData = command.commandData;
        }
        return commandData;
    }

    async applyToBase(): Promise<void> {
        const serverChangeResponse = await this.commandsService.changeCommand(this.commandID);
        const serverUnselectResponse = await this.commandsService.unselectCommand(this.commandID);
        if (serverChangeResponse !== undefined && serverUnselectResponse !== undefined) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.transferData(this.selectedCommand, this.hiddenCommand);
            this.commandsService.reDrawAllExcept('NULL');
            this.commandsService.resetSelectedBy(this.commandID);
            this.textService.confirmText();
            this.textService.clear();
            this.resetSelection();
            this.changingToolsService.currentTool = this.changingToolsService.previousTool;
        }
    }

    transferData(srcCommand: Command, targetCommand: Command): void {
        if (
            (srcCommand instanceof DrawRectangleCommand && targetCommand instanceof DrawRectangleCommand) ||
            (srcCommand instanceof DrawEllipseCommand && targetCommand instanceof DrawEllipseCommand)
        ) {
            targetCommand.commandData.beginning = srcCommand.commandData.beginning;
            targetCommand.commandData.end = srcCommand.commandData.end;
        }
    }

    insidePreview(): boolean {
        return (
            this.lastMousePos.x > this.selectionPos.x &&
            this.lastMousePos.x < this.selectionPos.x + this.dimension.x &&
            this.lastMousePos.y > this.selectionPos.y &&
            this.lastMousePos.y < this.selectionPos.y + this.dimension.y
        );
    }

    resetSelection(): void {
        this.mouseDownCoord = NULL_COORD;
        this.selectionPos = NULL_COORD;
        this.lastMousePos = NULL_COORD;
        this.dimension = NULL_COORD;
        this.ogDimension = NULL_COORD;
        this.anchors = {
            TL: NULL_COORD,
            BR: NULL_COORD,
        };
        this.hasFlipped = {
            vertical: false,
            horizontal: false,
        };
        this.changeState(State.OFF);
        this.isActive.next(false);
        this.mouseDown = false;
        this.selectedCommand = {} as Command;
        this.hiddenCommand = {} as Command;
        this.commandID = '';
    }

    changeState(state: State): void {
        this.state = state;
        this.observableState.next(state);
    }

    async changeCommandColor(): Promise<void> {
        if (this.isActive && this.commandID !== '') {
            const serverResponse = await this.commandsService.changeCommandColour(
                this.commandID,
                this.colorService.primaryColor.hsla(),
                this.colorService.secondaryColor.hsla(),
                this.colorService.textColor.hsla(),
            );
            if (serverResponse !== undefined) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.selectedCommand.do(this.drawingService.previewCtx);
            }
        }
    }

    async changeSelectedStrokeSize(size: number): Promise<void> {
        if (this.isActive && this.commandID !== '') {
            const serverResponse = await this.commandsService.changeCommandSize(this.commandID, size);
            if (serverResponse !== undefined) {
                this.placeBoundingBox(this.selectedCommand);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.selectedCommand.do(this.drawingService.previewCtx);
            }
        }
    }

    private resizeN(): void {
        if (this.flipToSouth(State.S)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.anchors.BR.y - this.lastMousePos.y < commandData.size * 2) {
                this.lastMousePos.y = this.anchors.BR.y - 2 * commandData.size;
            }
            commandData.beginning = { x: this.anchors.TL.x, y: this.lastMousePos.y };
            commandData.end.y = this.anchors.BR.y;
        }
        this.selectionPos = { x: this.anchors.TL.x, y: this.lastMousePos.y };
        this.dimension.y = this.anchors.BR.y - this.selectionPos.y;
        this.setAnchors();
    }

    private resizeS(): void {
        if (this.flipToNorth(State.N)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.lastMousePos.y - this.anchors.TL.y < commandData.size * 2) {
                this.lastMousePos.y = this.anchors.TL.y + 2 * commandData.size;
            }
            commandData.beginning = { x: this.anchors.TL.x, y: this.anchors.TL.y };
            commandData.end.y = this.lastMousePos.y;
        }
        this.selectionPos = { x: this.anchors.TL.x, y: this.anchors.TL.y };
        this.dimension.y = this.lastMousePos.y - this.selectionPos.y;
        this.setAnchors();
    }

    private resizeE(): void {
        if (this.flipToWest(State.W)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.lastMousePos.x - this.anchors.TL.x < commandData.size * 2) {
                this.lastMousePos.x = this.anchors.TL.x + 2 * commandData.size;
            }
            commandData.beginning = { x: this.anchors.TL.x, y: this.anchors.TL.y };
            commandData.end.x = this.lastMousePos.x;
        }
        this.selectionPos = { x: this.anchors.TL.x, y: this.anchors.TL.y };
        this.dimension.x = this.lastMousePos.x - this.anchors.TL.x;
        this.setAnchors();
    }

    private resizeW(): void {
        if (this.flipToEast(State.E)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.anchors.BR.x - this.lastMousePos.x < commandData.size * 2) {
                this.lastMousePos.x = this.anchors.BR.x - 2 * commandData.size;
            }
            commandData.beginning = { x: this.lastMousePos.x, y: this.anchors.TL.y };
            commandData.end.x = this.anchors.BR.x;
        }
        this.selectionPos = { x: this.lastMousePos.x, y: this.anchors.TL.y };
        this.dimension.x = this.anchors.BR.x - this.lastMousePos.x;
        this.setAnchors();
    }

    private resizeSE(): void {
        if (this.flipToNorth(State.NE) || this.flipToWest(State.SW)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.lastMousePos.y - this.anchors.TL.y < commandData.size * 2) {
                this.lastMousePos.y = this.anchors.TL.y + 2 * commandData.size;
            }
            if (commandData.withStroke && this.lastMousePos.x - this.anchors.TL.x < commandData.size * 2) {
                this.lastMousePos.x = this.anchors.TL.x + 2 * commandData.size;
            }
            commandData.beginning = { x: this.anchors.TL.x, y: this.anchors.TL.y };
            commandData.end = { x: this.lastMousePos.x, y: this.lastMousePos.y };
        }
        this.selectionPos = { x: this.anchors.TL.x, y: this.anchors.TL.y };
        this.dimension = { x: this.lastMousePos.x - this.anchors.TL.x, y: this.lastMousePos.y - this.anchors.TL.y };
        this.setAnchors();
    }

    private resizeSW(): void {
        if (this.flipToNorth(State.NW) || this.flipToEast(State.SE)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.lastMousePos.y - this.anchors.TL.y < commandData.size * 2) {
                this.lastMousePos.y = this.anchors.TL.y + 2 * commandData.size;
            }
            if (commandData.withStroke && this.anchors.BR.x - this.lastMousePos.x < commandData.size * 2) {
                this.lastMousePos.x = this.anchors.BR.x - 2 * commandData.size;
            }
            commandData.beginning = { x: this.lastMousePos.x, y: this.anchors.TL.y };
            commandData.end = { x: this.anchors.BR.x, y: this.lastMousePos.y };
        }
        this.selectionPos = { x: this.lastMousePos.x, y: this.anchors.TL.y };
        this.dimension = { x: this.anchors.BR.x - this.selectionPos.x, y: this.lastMousePos.y - this.anchors.TL.y };
        this.setAnchors();
    }

    private resizeNE(): void {
        if (this.flipToSouth(State.SE) || this.flipToWest(State.NW)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.anchors.BR.y - this.lastMousePos.y < commandData.size * 2) {
                this.lastMousePos.y = this.anchors.BR.y - 2 * commandData.size;
            }
            if (commandData.withStroke && this.lastMousePos.x - this.anchors.TL.x < commandData.size * 2) {
                this.lastMousePos.x = this.anchors.TL.x + 2 * commandData.size;
            }
            commandData.beginning = { x: this.anchors.TL.x, y: this.lastMousePos.y };
            commandData.end = { x: this.lastMousePos.x, y: this.anchors.BR.y };
        }
        this.selectionPos = { x: this.anchors.TL.x, y: this.lastMousePos.y };
        this.dimension = { x: this.lastMousePos.x - this.anchors.TL.x, y: this.anchors.BR.y - this.lastMousePos.y };
        this.setAnchors();
    }

    private resizeNW(): void {
        if (this.flipToSouth(State.SW) || this.flipToEast(State.NE)) return;
        if (this.selectedCommand instanceof DrawRectangleCommand || this.selectedCommand instanceof DrawEllipseCommand) {
            const commandData = this.getCommandData(this.selectedCommand);
            if (commandData.withStroke && this.anchors.BR.y - this.lastMousePos.y < commandData.size * 2) {
                this.lastMousePos.y = this.anchors.BR.y - 2 * commandData.size;
            }
            if (commandData.withStroke && this.anchors.BR.x - this.lastMousePos.x < commandData.size * 2) {
                this.lastMousePos.x = this.anchors.BR.x - 2 * commandData.size;
            }
            commandData.beginning = { x: this.lastMousePos.x, y: this.lastMousePos.y };
            commandData.end = { x: this.anchors.BR.x, y: this.anchors.BR.y };
        }
        this.selectionPos = { x: this.lastMousePos.x, y: this.lastMousePos.y };
        this.dimension = { x: this.anchors.BR.x - this.lastMousePos.x, y: this.anchors.BR.y - this.lastMousePos.y };
        this.setAnchors();
    }

    flipToNorth(targetState: State): boolean {
        if (this.lastMousePos.y < this.anchors.TL.y) {
            this.state = targetState;
            this.hasFlipped.horizontal = !this.hasFlipped.horizontal;
            this.anchors.BR.y = this.anchors.TL.y;
            return true;
        }
        return false;
    }

    flipToSouth(targetState: State): boolean {
        if (this.lastMousePos.y > this.anchors.BR.y) {
            this.state = targetState;
            this.hasFlipped.horizontal = !this.hasFlipped.horizontal;
            this.anchors.TL.y = this.anchors.BR.y;
            this.selectionPos.y = this.anchors.TL.y;
            return true;
        }
        return false;
    }

    flipToEast(targetState: State): boolean {
        if (this.lastMousePos.x > this.anchors.BR.x) {
            this.state = targetState;
            this.hasFlipped.vertical = !this.hasFlipped.vertical;
            this.anchors.TL.x = this.anchors.BR.x;
            this.selectionPos.x = this.anchors.TL.x;
            return true;
        }
        return false;
    }

    flipToWest(targetState: State): boolean {
        if (this.lastMousePos.x < this.anchors.TL.x) {
            this.state = targetState;
            this.hasFlipped.vertical = !this.hasFlipped.vertical;
            this.anchors.BR.x = this.anchors.TL.x;
            return true;
        }
        return false;
    }

    arrangePath(command: DrawPencilCommand): void {
        for (let i = 0; i < command.commandData.pathData.length; i++) {
            command.commandData.pathData[i] = {
                x: command.commandData.pathData[i].x - this.selectionPos.x,
                y: command.commandData.pathData[i].y - this.selectionPos.y,
            };
        }
        this.drawingService.previewCtx.translate(this.selectionPos.x, this.selectionPos.y);
    }

    scalePencileStroke(command: DrawPencilCommand): void {
        const scaleFactor = {
            x: this.dimension.x / this.ogDimension.x,
            y: this.dimension.y / this.ogDimension.y,
        };

        for (let i = 0; i < command.commandData.pathData.length; i++) {
            command.commandData.pathData[i] = {
                x: command.commandData.pathData[i].x * scaleFactor.x + this.selectionPos.x,
                y: command.commandData.pathData[i].y * scaleFactor.y + this.selectionPos.y,
            };
        }
        this.drawingService.previewCtx.restore();
    }

    setAnchors(): void {
        this.anchors = {
            TL: { x: this.selectionPos.x, y: this.selectionPos.y },
            BR: { x: this.selectionPos.x + this.dimension.x, y: this.selectionPos.y + this.dimension.y },
        };
    }

    private initFunctionMap(): void {
        this.functionMap = new Map<State, () => void>([
            [State.N, () => this.resizeN()],
            [State.E, () => this.resizeE()],
            [State.S, () => this.resizeS()],
            [State.W, () => this.resizeW()],
            [State.SE, () => this.resizeSE()],
            [State.SW, () => this.resizeSW()],
            [State.NW, () => this.resizeNW()],
            [State.NE, () => this.resizeNE()],
        ]);
    }
}
