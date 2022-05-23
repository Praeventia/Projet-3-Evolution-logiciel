import { Component } from '@angular/core';
import { DrawEllipseCommand } from '@app/classes/commands/draw-ellipse-command';
import { DrawPencilCommand } from '@app/classes/commands/draw-pencil-command';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
import { DEFAULT_TOOL_SIZE, MAX_SIDES, MAX_SLIDER_SIZE_OPACITY, MIN_SIDES, MIN_SLIDER_SIZE_OPACITY } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { SelectionService, State } from '@app/services/tools/selection/selection.service';
import { ToolType } from '@app/tool-type';

const MIN_SLIDER_SIZE = 1;
const MAX_SLIDER_SIZE = 40;
@Component({
    selector: 'app-sidebar-properties',
    templateUrl: './sidebar-properties.component.html',
    styleUrls: ['./sidebar-properties.component.scss'],
})
export class SidebarPropertiesComponent {
    minSliderOpacity: number = MIN_SLIDER_SIZE_OPACITY;
    maxSliderOpacity: number = MAX_SLIDER_SIZE_OPACITY;
    maxSliderSize: number = MAX_SLIDER_SIZE;
    currentToolSize: number = DEFAULT_TOOL_SIZE;
    minSidesSlider: number = MIN_SIDES;
    maxSidesSlider: number = MAX_SIDES;
    selectionIdle: boolean = false;
    showColorProp: boolean = true;

    constructor(
        private changingToolsService: ChangingToolsService,
        public toolsInfoService: ToolsInfoService,
        private selectionService: SelectionService,
        public drawingsService: DrawingsService,
    ) {
        this.selectionService.stateObserver().subscribe((state: State) => {
            this.selectionIdle = this.changingToolsService.currentTool === ToolType.selection && state === State.IDLE;
            if (this.selectionIdle) {
                if (this.selectionService.selectedCommand instanceof DrawPencilCommand) {
                    this.currentToolSize = this.selectionService.selectedCommand.commandData.size;
                } else if (this.selectionService.selectedCommand instanceof DrawRectangleCommand) {
                    this.currentToolSize = this.selectionService.selectedCommand.commandData.size;
                } else if (this.selectionService.selectedCommand instanceof DrawEllipseCommand) {
                    this.currentToolSize = this.selectionService.selectedCommand.commandData.size;
                }
            }
            if (this.changingToolsService.currentTool === ToolType.selection && this.selectionService.state === State.OFF) {
                this.showColorProp = false;
            } else {
                this.showColorProp = true;
            }
        });
        this.changingToolsService.getToolChanged().subscribe(() => {
            if (this.changingToolsService.currentTool === ToolType.selection && this.selectionService.state === State.OFF) {
                this.showColorProp = false;
            } else {
                this.showColorProp = true;
            }
            this.currentToolSize = this.toolsInfoService.getSizeOf(this.currentTool);
        });
    }

    get currentTool(): ToolType {
        return this.changingToolsService.currentTool;
    }

    get minSliderSize(): number {
        return MIN_SLIDER_SIZE;
    }

    get tooltype(): typeof ToolType {
        return ToolType;
    }

    onToolChanged(tool: ToolType): void {
        this.changingToolsService.currentTool = tool;
    }

    onSizeChanged(size: number): void {
        if (this.selectionIdle) {
            if (this.selectionService.selectedCommand instanceof DrawPencilCommand) {
                this.toolsInfoService.setSizeOf(ToolType.pencil, size);
                this.currentToolSize = this.toolsInfoService.getSizeOf(ToolType.pencil);
            } else if (this.selectionService.selectedCommand instanceof DrawRectangleCommand) {
                this.toolsInfoService.setSizeOf(ToolType.rectangle, size);
                this.currentToolSize = this.toolsInfoService.getSizeOf(ToolType.rectangle);
            } else if (this.selectionService.selectedCommand instanceof DrawEllipseCommand) {
                this.toolsInfoService.setSizeOf(ToolType.ellipse, size);
                this.currentToolSize = this.toolsInfoService.getSizeOf(ToolType.ellipse);
            }
            this.selectionService.changeSelectedStrokeSize(size);
        } else {
            this.toolsInfoService.setSizeOf(this.changingToolsService.currentTool, size);
            this.currentToolSize = size;
        }
    }
}
