import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { NULL_INDEX } from '@app/const';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService, StrokeInfo } from '@app/services/commands-service/commands.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService, State } from '@app/services/tools/selection/selection.service';
import { UserService } from '@app/services/user/user.service';
import { ToolType } from '@app/tool-type';

@Component({
    selector: 'app-layers-list',
    templateUrl: './layers-list.component.html',
    styleUrls: ['./layers-list.component.scss'],
})
export class LayersListComponent {
    layers: StrokeInfo[];
    index: number;

    constructor(
        public commandsService: CommandsService,
        public selectionService: SelectionService,
        public changingToolService: ChangingToolsService,
        public userService: UserService,
        public drawingService: DrawingService,
    ) {
        this.selectionService.stateObserver().subscribe((state: State) => {
            if (state !== State.OFF) {
                this.index = this.commandsService.findCommandByID(this.commandsService.findSelectedCommand());
            } else {
                this.index = NULL_INDEX;
            }
        });
        this.commandsService.addedCommandObserver().subscribe(() => {
            this.index = this.commandsService.findCommandByID(this.commandsService.findSelectedCommand());
        });
        this.commandsService.deletedCommandObserver().subscribe(() => {
            this.index = this.commandsService.findCommandByID(this.commandsService.findSelectedCommand());
        });
        this.commandsService.updateCommandsObserver().subscribe(() => {
            this.layers = commandsService.strokeInfos;
            if (this.commandsService.oldIndexFromServerSwitch !== NULL_INDEX && this.commandsService.newIndexFromServerSwitch !== NULL_INDEX) {
                const oldIndex = this.commandsService.oldIndexFromServerSwitch;
                const newIndex = this.commandsService.newIndexFromServerSwitch;
                this.updateStacks(oldIndex, newIndex);
                this.commandsService.reDrawAllExcept(this.selectionService.commandID);
                this.commandsService.oldIndexFromServerSwitch = NULL_INDEX;
                this.commandsService.newIndexFromServerSwitch = NULL_INDEX;
            }
        });
    }

    async moveUp(): Promise<void> {
        if (this.index !== 0 && this.index !== NULL_INDEX) {
            await this.moveLayer(this.index, this.index - 1);
        }
    }

    async moveDown(): Promise<void> {
        if (this.index !== this.layers.length - 1 && this.index !== NULL_INDEX) {
            await this.moveLayer(this.index, this.index + 1);
        }
    }

    async sendToFront(): Promise<void> {
        if (this.index !== NULL_INDEX) {
            await this.moveLayer(this.index, 0);
        }
    }

    async sendToBack(): Promise<void> {
        if (this.index !== NULL_INDEX) {
            await this.moveLayer(this.index, this.layers.length - 1);
        }
    }

    async drop(event: CdkDragDrop<string[]>): Promise<void> {
        if (this.layers[event.previousIndex].selectedBy === '' || this.layers[event.previousIndex].selectedBy === this.userService.user?.username) {
            await this.moveLayer(event.previousIndex, event.currentIndex);
            await this.selectionService.selectCommand(this.commandsService.commandIDs[this.index]);
        }
    }

    async selectStroke(index: number): Promise<void> {
        if (this.layers[index].selectedBy === '') {
            this.changingToolService.currentTool = ToolType.selection;
            await this.selectionService.selectCommand(this.commandsService.commandIDs[index]).then(() => {
                this.index = index;
                this.selectionService.selectedCommand.do(this.drawingService.previewCtx);
            });
        }
    }

    async moveLayer(oldIndex: number, newIndex: number): Promise<void> {
        const switchServerResponse = await this.commandsService.switchCommand(oldIndex, newIndex);
        if (switchServerResponse !== undefined) {
            this.switchLayers(oldIndex, newIndex);
        }
    }

    switchLayers(oldIndex: number, newIndex: number): void {
        this.updateStacks(oldIndex, newIndex);
        this.index = newIndex;
        this.selectionService.commandIndex = newIndex;
        this.commandsService.reDrawAllExcept(this.commandsService.commandIDs[this.index]);
    }

    updateStacks(previousIndex: number, newIndex: number): void {
        moveItemInArray(this.commandsService.commands, previousIndex, newIndex);
        moveItemInArray(this.commandsService.hiddenCommands, previousIndex, newIndex);
        moveItemInArray(this.commandsService.hiddenColours, previousIndex, newIndex);
        moveItemInArray(this.commandsService.strokeInfos, previousIndex, newIndex);
        moveItemInArray(this.commandsService.commandIDs, previousIndex, newIndex);
    }
}
