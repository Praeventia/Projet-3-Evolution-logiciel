import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { SelectionService, State } from '@app/services/tools/selection/selection.service';
import { ToolType } from '@app/tool-type';
// import { ToolType } from '@app/tool-type';
@Component({
    selector: 'app-selection',
    templateUrl: './selection.component.html',
    styleUrls: ['./selection.component.scss'],
})
export class SelectionComponent implements OnInit, OnDestroy {
    constructor(private changingToolsService: ChangingToolsService, private selectionService: SelectionService) {}

    ngOnInit(): void {
        this.changingToolsService.getToolChanged().subscribe(() => {
            if (this.changingToolsService.currentTool !== ToolType.selection) {
                this.selectionService.onKeyDownEscape();
            }
        });
    }

    ngOnDestroy(): void {
        this.selectionService.onKeyDownEscape();
    }

    setState(state: number): void {
        this.selectionService.changeState(state);
    }

    get width(): number {
        return this.selectionService.dimension.x;
    }

    get height(): number {
        return this.selectionService.dimension.y;
    }

    get left(): number {
        return this.selectionService.selectionPos.x;
    }

    get top(): number {
        return this.selectionService.selectionPos.y;
    }

    get isActive(): boolean {
        return this.selectionService.state !== State.OFF;
    }
}
