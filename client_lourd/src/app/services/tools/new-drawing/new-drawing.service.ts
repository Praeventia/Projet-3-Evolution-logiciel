import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';

@Injectable({
    providedIn: 'root',
})
export class NewDrawingService {
    constructor(
        public drawingService: DrawingService,
        public dialogService: DialogService,
        private toolsInfoService: ToolsInfoService,
        private commandsService: CommandsService,
    ) {}

    left: number = 0;
    top: number = 0;
    wasLoaded: boolean = false;

    createNewCanvas(): void {
        this.drawingService.baseImage = undefined;
        this.drawingService.setBaseImage();
    }

    loadDrawing(image: HTMLImageElement): void {
        this.wasLoaded = true;

        const newCanvasSize: Vec2 = {
            x: image.width,
            y: image.height,
        };
        this.setupCanvas(newCanvasSize);

        this.drawingService.baseImage = image;
        this.drawingService.setBaseImage();
    }

    setupCanvas(newCanvasSize: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectionCtx);
        this.toolsInfoService.setNewDrawing();
        this.commandsService.clearAllCommands();
    }
}
