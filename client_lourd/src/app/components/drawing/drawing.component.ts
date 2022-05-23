import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorService } from '@app/services/editor/editor.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { NewDrawingService } from '@app/services/tools/new-drawing/new-drawing.service';
import { ToolType } from '@app/tool-type';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('selectionCanvas', { static: false }) selectionCanvas: ElementRef<HTMLCanvasElement>;

    DEFAULT_WIDTH: number = DEFAULT_WIDTH;
    DEFAULT_HEIGHT: number = DEFAULT_HEIGHT;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private selectionCtx: CanvasRenderingContext2D;

    constructor(
        private drawingService: DrawingService,
        private changingToolsService: ChangingToolsService,
        private keyEventService: KeyEventService,
        private newDrawingService: NewDrawingService,
        private toolsBoxService: ToolsBoxService,
        private socketService: SocketService,
        private editorService: EditorService,
    ) {}
    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.selectionCtx = this.selectionCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.selectionCtx = this.selectionCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.selectionCanvas = this.selectionCanvas.nativeElement;

        this.changingToolsService.getToolChanged().subscribe(() => {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        });

        setTimeout(() => {
            const { left, top } = this.baseCanvas.nativeElement.getBoundingClientRect();
            for (const key of Array.from(this.toolsBoxService.tools.keys())) {
                (this.toolsBoxService.tools.get(key) as Tool).setLeftAndTopOffsets(left, top);
            }
            this.newDrawingService.left = left;
            this.newDrawingService.top = top;

            this.newDrawingService.createNewCanvas();

            if (this.newDrawingService.wasLoaded) {
                this.newDrawingService.wasLoaded = false;
            }
        });

        this.changingToolsService.currentTool = ToolType.pencil;
    }

    @HostListener('window:popstate', [])
    onPopState(): void {
        this.newDrawingService.wasLoaded = false;
    }

    @HostListener('window:beforeunload', ['$event'])
    onUnload(): void {
        // ts-lint:disable-next-line: no-empty
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (!this.socketService.drawingConnected) this.editorService.connectDrawing();
        else this.keyEventService.onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.keyEventService.onMouseUp(event);
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.keyEventService.onMouseMove(event);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMoveWindow(event: MouseEvent): void {
        this.keyEventService.onMouseMoveWindow(event);
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        this.keyEventService.onMouseLeave(event);
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.keyEventService.onMouseEnter(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.keyEventService.onKeyUp(event);
    }

    @HostListener('window:wheel', ['$event'])
    onWhellEvent(event: WheelEvent): void {
        this.keyEventService.onWheelEvent(event);
    }
}
