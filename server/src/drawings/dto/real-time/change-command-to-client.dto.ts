import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CommandToClientDto } from './command-to-client.dto';


export class ChangeCommandToClientDto {
    @IsMongoId()
    commandID: string;

    @IsNotEmpty()
    commandToClient: CommandToClientDto;
}
