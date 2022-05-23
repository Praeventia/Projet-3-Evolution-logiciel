import { CommandFromClient } from '@app/classes/commands/data/command-from-client';

export interface ChangeCommandFromClient {
    commandID: string;
    commandFromClient: CommandFromClient;
}
