// tslint:disable: variable-name
import { CommandFromClient } from '@app/classes/commands/data/command-from-client';

export class CommandToClient {
    command: CommandFromClient;
    commandNumber: number;
    drawingID: number;
    owner: string;
    timestamp: Date;
    _id: string;
}
