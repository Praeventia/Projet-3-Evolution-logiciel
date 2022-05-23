import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CommandFromClientDto } from './command-from-client.dto';


export class ChangeCommandFromClientDto {
    @IsMongoId()
    commandID: string;

    @IsNotEmpty()
    commandFromClient: CommandFromClientDto;
}
