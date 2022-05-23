import { Component } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { ToolType } from '@app/tool-type';

export interface SidebarInformation {
    tooltype: ToolType;
    src: string;
    alt: string;
    matTooltip: string;
    hidden: boolean;
}

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    newDrawingInformation: string = 'Nouveau dessin [ CTRL + O ]';
    exportDrawingInformation: string = 'Exporter le dessin [CTRL + E]';
    saveDrawingInformation: string = 'Sauvegarder un dessin [ CTRL + S ]';

    columnInformation: SidebarInformation[] = [
        { tooltype: ToolType.pencil, src: 'assets/tools/pencil.svg', alt: 'Crayon', matTooltip: 'Crayon [ C ]', hidden: false },
        {
            tooltype: ToolType.rectangle,
            src: 'assets/tools/rectangle.svg',
            alt: 'Rectangle',
            matTooltip: 'Rectangle [ 1 ]',
            hidden: false,
        },
        { tooltype: ToolType.ellipse, src: 'assets/tools/ellipse.svg', alt: 'Ellipse', matTooltip: 'Ellipse [ 2 ]', hidden: false },
        {
            tooltype: ToolType.selection,
            src: 'assets/tools/selection.png',
            alt: 'Selection',
            matTooltip: 'Selection',
            hidden: false,
        },
    ];

    constructor(
        private changingToolsService: ChangingToolsService,
        public toolsInfoService: ToolsInfoService,
        public socketService: SocketService,
        public colorService: ColorService,
    ) {}

    get currentTool(): ToolType {
        return this.changingToolsService.currentTool;
    }

    get tooltype(): typeof ToolType {
        return ToolType;
    }

    onToolChanged(tool: ToolType): void {
        this.changingToolsService.currentTool = tool;
        this.changingToolsService.previousTool = tool;
    }
}
