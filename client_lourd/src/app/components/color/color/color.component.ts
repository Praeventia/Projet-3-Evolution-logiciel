import { Component } from '@angular/core';
import { Color } from '@app/classes/color';
import { DrawPencilCommand } from '@app/classes/commands/draw-pencil-command';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ColorService } from '@app/services/tools/color/color.service';
import { SelectionService, State } from '@app/services/tools/selection/selection.service';
import { ToolType } from '@app/tool-type';

@Component({
    selector: 'app-color',
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.scss'],
})
export class ColorComponent {
    primaryColor: Color;
    secondaryColor: Color;
    textColor: Color;
    showAllColors: boolean = false;
    constructor(public colorService: ColorService, private changingToolsService: ChangingToolsService, private selectionService: SelectionService) {
        this.colorService.colorChangedListener().subscribe(() =>
            setTimeout(() => {
                this.primaryColor = this.colorService.primaryColor;
                this.secondaryColor = this.colorService.secondaryColor;
                this.textColor = this.colorService.textColor;
            }),
        );
        this.primaryColor = this.colorService.primaryColor;
        this.secondaryColor = this.colorService.secondaryColor;
        this.textColor = this.colorService.textColor;

        this.changingToolsService.getToolChanged().subscribe(() => {
            this.showAllColors =
                this.changingToolsService.currentTool === ToolType.pencil ||
                (this.selectionService.state === State.IDLE && this.selectionService.selectedCommand instanceof DrawPencilCommand);
        });

        this.selectionService.stateObserver().subscribe(() => {
            this.showAllColors =
                this.changingToolsService.currentTool === ToolType.pencil ||
                (this.selectionService.state === State.IDLE && this.selectionService.selectedCommand instanceof DrawPencilCommand);
        });
    }
}
