import { CommandFromClientDto } from './command-from-client.dto';

export class CommandToClientDto {
    timestamp: Date;
    owner: string;
    drawingID: string;
    command: CommandFromClientDto
    commandNumber: number;
    _id: string;
}