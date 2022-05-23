import { IsMongoId } from 'class-validator';

export class SelectCommandFromClientDto {
    @IsMongoId()
    commandID: string;
}