// tslint:disable: max-file-line-count
// tslint:disable: no-any
// tslint:disable: prefer-for-of
import { Injectable } from '@angular/core';
import { Command } from '@app/classes/commands/command';
import { ChangeCommandFromClient } from '@app/classes/commands/data/change-command-from-client';
import { ChangeCommandToClient } from '@app/classes/commands/data/change-command-to-client';
import { CommandFromClient } from '@app/classes/commands/data/command-from-client';
import { CommandToClient } from '@app/classes/commands/data/command-to-client';
import { DeleteCommandFromClient } from '@app/classes/commands/data/delete-command-from-client';
import { DeleteCommandToClient } from '@app/classes/commands/data/delete-command-to-client';
import { DrawEllipseData } from '@app/classes/commands/data/draw-ellipse-data';
import { DrawPencilData } from '@app/classes/commands/data/draw-pencil-data';
import { DrawRectangleData } from '@app/classes/commands/data/draw-rectangle-data';
import { SelectCommandFromClient } from '@app/classes/commands/data/select-command-from-client';
import { SelectCommandToClient } from '@app/classes/commands/data/select-command-to-client';
import { SwitchCommandFromClient } from '@app/classes/commands/data/switch-command-from-client';
import { SwitchCommandToClient } from '@app/classes/commands/data/switch-command-to-client';
import { UnselectCommandFromClient } from '@app/classes/commands/data/unselect-command-from-client';
import { UnselectCommandToClient } from '@app/classes/commands/data/unselect-command-to-client';
import { DrawEllipseCommand } from '@app/classes/commands/draw-ellipse-command';
import { DrawPencilCommand } from '@app/classes/commands/draw-pencil-command';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
import { MAX_ID_VALUE, NULL_INDEX } from '@app/const';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ColorInstance, ColorService } from '@app/services/tools/color/color.service';
import { UserService } from '@app/services/user/user.service';
import { ToolType } from '@app/tool-type';
import { BehaviorSubject, Observable } from 'rxjs';

// Selection is "stuck" if user draws after
// Local stack and server stack sometimes don't match

export interface SelectedStrokes {
    commandID: string;
    userID: string;
}

export interface CommandPacket {
    command: Command;
    hiddenCommand: Command;
    commandID: string;
    hiddenColour: HiddenColour;
    strokeInfo: StrokeInfo;
}
export interface StrokeInfo {
    type: string;
    primaryColour: string;
    secondaryColour: string;
    size: number;
    hasSecondary: boolean;
    selectedBy: string;
}
export interface HiddenColour {
    r: number;
    g: number;
    b: number;
}
@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    commands: Command[] = [];
    hiddenCommands: Command[] = [];
    commandIDs: string[] = [];
    hiddenColours: HiddenColour[] = [];
    strokeInfos: StrokeInfo[] = [];

    oldIndexFromServerSwitch: number = NULL_INDEX;
    newIndexFromServerSwitch: number = NULL_INDEX;
    updateCommands: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    addedCommand: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    deletedCommand: BehaviorSubject<number> = new BehaviorSubject<number>(NULL_INDEX);
    drawingID: string;
    selectedID: string = 'NULL';

    constructor(
        protected drawingService: DrawingService,
        protected socketService: SocketService,
        protected userService: UserService,
        protected httpService: HttpService,
        protected snackBarService: SnackBarService,
        protected colorService: ColorService,
    ) {
        this.socketService.notifyDrawingConnected().subscribe(() => {
            this.socketService.drawingSocket?.on('drawingFromServer', (commandToClient: CommandToClient) => {
                this.addCommandFromServer(commandToClient);
                this.addedCommand.next(null);
            });
            this.socketService.drawingSocket?.on('selectCommandFromServer', (selectCommandToClient: SelectCommandToClient) => {
                this.processSelectedFromServer(selectCommandToClient);
            });
            this.socketService.drawingSocket?.on('unselectCommandFromServer', (unselectCommandToClient: UnselectCommandToClient) => {
                this.processUnselectedFromServer(unselectCommandToClient);
            });
            this.socketService.drawingSocket?.on('changeCommandFromServer', (changeCommandToClient: ChangeCommandToClient) => {
                this.processChangeFromServer(changeCommandToClient);
            });
            this.socketService.drawingSocket?.on('switchCommandFromServer', (commandToClient: SwitchCommandToClient) => {
                this.processSwitchFromServer(commandToClient);
            });
            this.socketService.drawingSocket?.on('deleteCommandFromServer', (deleteCommandToClient: DeleteCommandToClient) => {
                this.processDeleteFromServer(deleteCommandToClient);
            });
            this.socketService.drawingSocket?.on('exception', (exception: any) => {
                if (exception?.statusCode !== '401' && exception?.statusCode !== '400') {
                    this.snackBarService.openSnackBar(exception.message);
                }
            });
        });
    }

    updateCommandsObserver(): Observable<any> {
        return this.updateCommands.asObservable();
    }

    addedCommandObserver(): Observable<any> {
        return this.addedCommand.asObservable();
    }

    deletedCommandObserver(): Observable<any> {
        return this.deletedCommand.asObservable();
    }

    async sendCommandToServer(command: CommandFromClient): Promise<any> {
        return new Promise((resolve) => {
            this.socketService.drawingSocket?.emit('drawingToServer', command, (commandToClient: CommandToClient) => {
                this.addCommandFromServer(commandToClient);
                resolve(commandToClient);
            });
        });
    }

    async selectCommand(commandIDToSelect: string): Promise<any> {
        if (this.userService.userConnected) {
            const commandToSelect: SelectCommandFromClient = {
                commandID: commandIDToSelect,
            };
            return new Promise((resolve) => {
                this.socketService.drawingSocket?.emit('selectCommandToServer', commandToSelect, (commandToClient: SelectCommandToClient) => {
                    this.selectedID = commandToClient.commandID;
                    this.setSelectedBy(this.userService.user?.username as string, commandIDToSelect);
                    resolve(commandToClient);
                });
            });
        }
    }

    async unselectCommand(commandIDToUnselect: string): Promise<any> {
        if (this.userService.userConnected) {
            const commandToUnselect: UnselectCommandFromClient = {
                commandID: commandIDToUnselect,
            };
            return new Promise((resolve) => {
                this.socketService.drawingSocket?.emit('unselectCommandToServer', commandToUnselect, (commandToClient: UnselectCommandToClient) => {
                    this.selectedID = 'NULL';
                    this.resetSelectedBy(commandIDToUnselect);
                    resolve(commandToClient);
                });
            });
        }
    }

    // This also unselects the command as changing a selection inherently applies it and unselects it
    async changeCommand(changeCommandID: string): Promise<any> {
        const index = this.findCommandByID(changeCommandID);
        if (this.userService.userConnected) {
            let toolType = {} as ToolType;
            if (this.commands[index] instanceof DrawPencilCommand) {
                toolType = ToolType.pencil;
            } else if (this.commands[index] instanceof DrawRectangleCommand) {
                toolType = ToolType.rectangle;
            } else if (this.commands[index] instanceof DrawEllipseCommand) {
                toolType = ToolType.ellipse;
            }
            const commandToChange: ChangeCommandFromClient = {
                commandID: changeCommandID,
                commandFromClient: { tool: toolType, commandData: this.commands[index].commandData } as CommandFromClient,
            };
            return new Promise((resolve) => {
                this.socketService.drawingSocket?.emit('changeCommandToServer', commandToChange, (commandToClient: ChangeCommandToClient) => {
                    resolve(commandToClient);
                });
            });
        }
    }

    async switchCommand(currentIndex: number, newIndex: number): Promise<any> {
        if (this.userService.userConnected) {
            const switchCommands: SwitchCommandFromClient = {
                commandPosition: this.getOppositeIndex(currentIndex),
                newPosition: this.getOppositeIndex(newIndex),
            };
            return new Promise((resolve) => {
                this.socketService.drawingSocket?.emit('switchCommandToServer', switchCommands, (commandToClient: SwitchCommandToClient) => {
                    resolve(commandToClient);
                });
            });
        }
    }

    async deleteCommand(commandIDToDelete: string): Promise<void> {
        if (this.userService.userConnected) {
            const switchCommands: DeleteCommandFromClient = {
                commandID: commandIDToDelete,
            };
            return new Promise((resolve) => {
                this.socketService.drawingSocket?.emit('deleteCommandToServer', switchCommands, () => {
                    this.deleteCommandLocally(commandIDToDelete);
                    resolve();
                });
            });
        }
    }

    addCommandFromServer(commandToClient: CommandToClient): void {
        // Build all instances of commands needed from data received from server
        const commandPacket = this.buildCommands(commandToClient);
        if (commandPacket !== undefined) {
            // Add each instances of commands to the local stacks
            this.addCommandPacket(commandPacket);
            // Draw on the baseCtx and the selectionCtx
            const index = this.findCommandByID(commandToClient._id);
            if (this.strokeInfos[index].selectedBy !== '' && this.strokeInfos[index].selectedBy !== this.userService.user?.username) {
                this.drawOverlay(commandPacket.command);
            } else {
                commandPacket.command.do(this.drawingService.baseCtx);
            }
            commandPacket.hiddenCommand.do(this.drawingService.selectionCtx);
        }
    }

    // Build the command instances needed from the Data received from the server
    buildCommands(commandToClient: any): CommandPacket | undefined {
        let commandPacket;
        // Create a unique ID (rgb value) for the stroke
        const hiddenColor = { r: this.getRandomInt(), g: this.getRandomInt(), b: this.getRandomInt() };
        const stringColour = this.hiddenColourToString(hiddenColor);
        switch (commandToClient.command.tool) {
            case ToolType.pencil: {
                const pencilCommand = new DrawPencilCommand(commandToClient.command.commandData as DrawPencilData);
                const hiddenData: DrawPencilData = {
                    pathData: pencilCommand.commandData.pathData,
                    color: stringColour,
                    size: pencilCommand.commandData.size,
                };
                const hiddenPencilCommand = new DrawPencilCommand(hiddenData);
                const pencilStrokeInfo: StrokeInfo = {
                    type: 'Crayon',
                    primaryColour: pencilCommand.commandData.color,
                    secondaryColour: '',
                    size: pencilCommand.commandData.size,
                    hasSecondary: false,
                    selectedBy: '',
                };
                commandPacket = {
                    command: pencilCommand,
                    hiddenCommand: hiddenPencilCommand,
                    commandID: commandToClient._id,
                    hiddenColour: hiddenColor,
                    strokeInfo: pencilStrokeInfo,
                };
                break;
            }

            case ToolType.rectangle: {
                const rectCommand = new DrawRectangleCommand(commandToClient.command.commandData as DrawRectangleData);
                let hiddenFill = stringColour;
                if (this.clearColor(rectCommand.commandData.fillColor)) {
                    hiddenFill = 'clear';
                }
                const hiddenData: DrawRectangleData = {
                    strokeColor: stringColour,
                    fillColor: hiddenFill,
                    size: rectCommand.commandData.size,
                    withStroke: rectCommand.commandData.withStroke,
                    withFill: rectCommand.commandData.withFill,
                    isEven: rectCommand.commandData.isEven,
                    beginning: rectCommand.commandData.beginning,
                    end: rectCommand.commandData.end,
                    text: rectCommand.commandData.text,
                    textColor: rectCommand.commandData.textColor,
                };
                const hiddenRectCommand = new DrawRectangleCommand(hiddenData);

                const rectStrokeInfo: StrokeInfo = {
                    type: 'Rectangle',
                    primaryColour: rectCommand.commandData.strokeColor,
                    secondaryColour: rectCommand.commandData.fillColor,
                    size: rectCommand.commandData.size,
                    hasSecondary: rectCommand.commandData.withFill && rectCommand.commandData.withStroke,
                    selectedBy: '',
                };
                commandPacket = {
                    command: rectCommand,
                    hiddenCommand: hiddenRectCommand,
                    commandID: commandToClient._id,
                    hiddenColour: hiddenColor,
                    strokeInfo: rectStrokeInfo,
                };
                break;
            }

            case ToolType.ellipse: {
                const ellCommand = new DrawEllipseCommand(commandToClient.command.commandData as DrawEllipseData);
                let hiddenFill = stringColour;
                if (this.clearColor(ellCommand.commandData.fillColor)) {
                    hiddenFill = 'clear';
                }
                const hiddenData: DrawEllipseData = {
                    drawPreview: false,
                    strokeColor: stringColour,
                    fillColor: hiddenFill,
                    size: ellCommand.commandData.size,
                    withStroke: ellCommand.commandData.withStroke,
                    withFill: ellCommand.commandData.withFill,
                    isEven: ellCommand.commandData.isEven,
                    beginning: ellCommand.commandData.beginning,
                    end: ellCommand.commandData.end,
                    text: ellCommand.commandData.text,
                    textColor: ellCommand.commandData.textColor,
                };
                const hiddenEllCommand = new DrawEllipseCommand(hiddenData);

                const ellStrokeInfo: StrokeInfo = {
                    type: 'Ellipse',
                    primaryColour: ellCommand.commandData.strokeColor,
                    secondaryColour: ellCommand.commandData.fillColor,
                    size: ellCommand.commandData.size,
                    hasSecondary: ellCommand.commandData.withFill && ellCommand.commandData.withStroke,
                    selectedBy: '',
                };
                commandPacket = {
                    command: ellCommand,
                    hiddenCommand: hiddenEllCommand,
                    commandID: commandToClient._id,
                    hiddenColour: hiddenColor,
                    strokeInfo: ellStrokeInfo,
                };
                break;
            }
        }
        return commandPacket;
    }

    async processSelectedFromServer(selectCommandToClient: SelectCommandToClient): Promise<void> {
        if (selectCommandToClient.commandID !== '') {
            const result = await this.getUsernameFromID(selectCommandToClient.userID);
            if (result !== undefined) {
                this.setSelectedBy(result.username, selectCommandToClient.commandID);
                this.reDrawAllExcept(this.selectedID);
            }
        }
    }

    processUnselectedFromServer(unselectCommandToClient: UnselectCommandToClient): void {
        if (unselectCommandToClient !== undefined) {
            this.resetSelectedBy(unselectCommandToClient.commandID);
            this.reDrawAllExcept(this.selectedID);
        }
    }

    processChangeFromServer(changeCommandToClient: ChangeCommandToClient): void {
        if (changeCommandToClient.commandID !== '') {
            const commandPacket = this.buildCommands(changeCommandToClient.commandToClient);
            if (commandPacket !== undefined) {
                this.changeCommandPacket(commandPacket, changeCommandToClient.commandID);
                this.resetSelectedBy(changeCommandToClient.commandID);
                this.reDrawAllExcept(this.selectedID);
            }
        }
    }

    processSwitchFromServer(switchCommandToClient: SwitchCommandToClient): void {
        if (switchCommandToClient.commandPosition !== NULL_INDEX && switchCommandToClient.newPosition !== NULL_INDEX) {
            this.oldIndexFromServerSwitch = this.getOppositeIndex(switchCommandToClient.commandPosition);
            this.newIndexFromServerSwitch = this.getOppositeIndex(switchCommandToClient.newPosition);
            this.updateCommands.next(null);
        }
    }

    processDeleteFromServer(deleteCommandToClient: DeleteCommandToClient): void {
        if (deleteCommandToClient !== undefined) {
            this.deleteCommandLocally(deleteCommandToClient.commandID);
            this.reDrawAllExcept(this.selectedID);
            this.deletedCommand.next(this.findCommandByID(deleteCommandToClient.commandID));
        }
    }

    setCommandsFromServer(serverCommands: CommandToClient[]): void {
        this.clearAllCommands();
        for (const command of serverCommands) {
            this.addCommandFromServer(command);
        }
        this.getSelectedStrokes();
        this.updateCommands.next(null);
    }

    setSelectedBy(username: string, commandID: string): void {
        for (let i = 0; i < this.strokeInfos.length; i++) {
            if (this.strokeInfos[i].selectedBy === username) {
                this.strokeInfos[i].selectedBy = '';
            }
            if (this.commandIDs[i] === commandID) {
                this.strokeInfos[this.findCommandByID(commandID)].selectedBy = username;
            }
        }
    }

    addCommandPacket(commandPacket: CommandPacket): void {
        this.commands.unshift(commandPacket.command);
        this.hiddenCommands.unshift(commandPacket.hiddenCommand);
        this.commandIDs.unshift(commandPacket.commandID);
        this.hiddenColours.unshift(commandPacket.hiddenColour);
        this.strokeInfos.unshift(commandPacket.strokeInfo);
    }

    changeCommandPacket(commandPacket: CommandPacket, commandID: string): void {
        let index = NULL_INDEX;
        for (let i = 0; i < this.commandIDs.length; i++) {
            if (this.commandIDs[i] === commandID) {
                index = i;
                break;
            }
        }
        this.commands[index] = commandPacket.command;
        this.hiddenCommands[index] = commandPacket.hiddenCommand;
        this.commandIDs[index] = commandPacket.commandID;
        this.hiddenColours[index] = commandPacket.hiddenColour;
        this.strokeInfos[index] = commandPacket.strokeInfo;
    }

    findCommandByID(id: string): number {
        for (let i = 0; i < this.commandIDs.length; i++) {
            if (this.commandIDs[i] === id) {
                return i;
            }
        }
        return NULL_INDEX;
    }

    findCommandByColour(hiddenColour: HiddenColour): number {
        for (let i = 0; i < this.hiddenColours.length; i++) {
            if (this.compareStrokeID(this.hiddenColours[i], hiddenColour)) {
                return i;
            }
        }
        return NULL_INDEX;
    }

    findSelectedCommand(): string {
        for (let i = 0; i < this.strokeInfos.length; i++) {
            if (this.strokeInfos[i].selectedBy === this.userService.user?.username) {
                return this.commandIDs[i];
            }
        }
        return '';
    }

    resetSelectedBy(commandID: string): void {
        this.strokeInfos[this.findCommandByID(commandID)].selectedBy = '';
    }

    compareStrokeID(stroke1: HiddenColour, stroke2: HiddenColour): boolean {
        return stroke1.r === stroke2.r && stroke1.g === stroke2.g && stroke1.b === stroke2.b;
    }

    async reDrawAllExcept(commandID: string): Promise<void> {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.clearCanvas(this.drawingService.selectionCtx);
        for (let i = this.commands.length - 1; i >= 0; i--) {
            const command = this.commands[i];
            if (this.commandIDs[i] !== commandID) {
                if (this.strokeInfos[i].selectedBy !== '' && this.strokeInfos[i].selectedBy !== this.userService.user?.username) {
                    this.drawOverlay(command);
                } else {
                    await this.commands[i].do(this.drawingService.baseCtx);
                }
                await this.hiddenCommands[i].do(this.drawingService.selectionCtx);
            }
        }
    }

    drawOverlay(command: Command): void {
        const selectedColor = 'rgba(255,0,0,0.6)';
        if (command instanceof DrawPencilCommand) {
            const selectedPencilData: DrawPencilData = {
                pathData: command.commandData.pathData,
                color: selectedColor,
                size: command.commandData.size,
            };
            const commandCopy = new DrawPencilCommand(selectedPencilData);
            commandCopy.do(this.drawingService.baseCtx);
        } else if (command instanceof DrawRectangleCommand) {
            const selectedRectData = {
                strokeColor: selectedColor,
                fillColor: selectedColor,
                size: command.commandData.size,
                withStroke: command.commandData.withStroke,
                withFill: command.commandData.withFill,
                isEven: command.commandData.isEven,
                beginning: command.commandData.beginning,
                end: command.commandData.end,
                text: command.commandData.text,
                textColor: selectedColor,
            } as DrawRectangleData;
            const commandCopy = new DrawRectangleCommand(selectedRectData);
            commandCopy.do(this.drawingService.baseCtx);
        } else if (command instanceof DrawEllipseCommand) {
            const selectedEllData = {
                strokeColor: selectedColor,
                fillColor: selectedColor,
                size: command.commandData.size,
                withStroke: command.commandData.withStroke,
                withFill: command.commandData.withFill,
                isEven: command.commandData.isEven,
                beginning: command.commandData.beginning,
                end: command.commandData.end,
                text: command.commandData.text,
                textColor: selectedColor,
            } as DrawEllipseData;
            const commandCopy = new DrawEllipseCommand(selectedEllData);
            commandCopy.do(this.drawingService.baseCtx);
        }
    }

    deleteCommandLocally(commandID: string): void {
        const index = this.findCommandByID(commandID);
        // Remove command's old position
        this.commands.forEach((dull, i) => {
            if (i === index) this.commands.splice(index, 1);
        });
        this.hiddenCommands.forEach((dull, i) => {
            if (i === index) this.hiddenCommands.splice(index, 1);
        });
        this.commandIDs.forEach((dull, i) => {
            if (i === index) this.commandIDs.splice(index, 1);
        });
        this.hiddenColours.forEach((dull, i) => {
            if (i === index) this.hiddenColours.splice(index, 1);
        });
        this.strokeInfos.forEach((dull, i) => {
            if (i === index) this.strokeInfos.splice(index, 1);
        });
    }

    async getUsernameFromID(userID: string): Promise<any> {
        return await this.httpService.get('/users/userInfo/' + userID, true);
    }

    async getSelectedStrokes(): Promise<void> {
        const selectedStrokes: SelectedStrokes[] = await this.httpService.get('/drawings/selectedCommandInDrawing/' + this.drawingID, true);
        for (let i = 0; i < selectedStrokes.length; i++) {
            const index = this.findCommandByID(selectedStrokes[i].commandID);
            if (index !== NULL_INDEX) {
                const user = await this.getUsernameFromID(selectedStrokes[i].userID);
                this.strokeInfos[index].selectedBy = user.username;
            }
        }
        this.reDrawAllExcept(this.selectedID);
    }

    async changeCommandSize(commandID: string, size: number): Promise<ChangeCommandToClient> {
        const index = this.findCommandByID(commandID);
        const command = this.commands[index];
        const hiddenCommand = this.hiddenCommands[index];
        if (
            (command instanceof DrawPencilCommand && hiddenCommand instanceof DrawPencilCommand) ||
            (command instanceof DrawRectangleCommand && hiddenCommand instanceof DrawRectangleCommand) ||
            (command instanceof DrawEllipseCommand && hiddenCommand instanceof DrawEllipseCommand)
        ) {
            command.commandData.size = size;
            hiddenCommand.commandData.size = size;
            this.strokeInfos[index].size = size;
        }
        return await this.changeCommand(commandID);
    }

    async changeCommandColour(commandID: string, strokeColor: string, fillColor: string, textColor: string): Promise<ChangeCommandToClient> {
        const index = this.findCommandByID(commandID);
        const command = this.commands[index];
        if (command instanceof DrawPencilCommand) {
            command.commandData.color = strokeColor;
            this.strokeInfos[index].primaryColour = strokeColor;
        } else if (command instanceof DrawRectangleCommand || command instanceof DrawEllipseCommand) {
            switch (this.colorService.colorInstance) {
                case ColorInstance.PRIMARY: {
                    command.commandData.strokeColor = strokeColor;
                    this.strokeInfos[index].primaryColour = strokeColor;
                }
                case ColorInstance.SECONDARY: {
                    command.commandData.fillColor = fillColor;
                    this.strokeInfos[index].secondaryColour = fillColor;
                }
                case ColorInstance.TEXT: {
                    command.commandData.textColor = textColor;
                }
            }
        }
        const hiddenCommand = this.hiddenCommands[index];
        if (hiddenCommand instanceof DrawRectangleCommand || hiddenCommand instanceof DrawEllipseCommand) {
            if (this.clearColor(fillColor)) {
                hiddenCommand.commandData.fillColor = 'clear';
            } else {
                hiddenCommand.commandData.fillColor = hiddenCommand.commandData.fillColor;
            }
        }
        return await this.changeCommand(commandID);
    }

    hiddenColourToString(hiddenColour: HiddenColour): string {
        return 'rgb(' + hiddenColour.r.toString() + ', ' + hiddenColour.g.toString() + ', ' + hiddenColour.b.toString() + ')';
    }

    getRandomInt(): number {
        return Math.floor(Math.random() * MAX_ID_VALUE);
    }

    getOppositeIndex(index: number): number {
        return this.commands.length - (index + 1);
    }

    getCommandFromID(commandID: string): Command | undefined {
        for (let i = 0; i < this.commandIDs.length; i++) {
            if (commandID === this.commandIDs[i]) {
                return this.commands[i];
            }
        }
        return undefined;
    }

    clearColor(color: string): boolean {
        return color[color.length - 2] === '0';
    }

    clearAllCommands(): void {
        this.commands = [];
        this.hiddenCommands = [];
        this.commandIDs = [];
        this.hiddenColours = [];
        this.strokeInfos = [];
    }
}
