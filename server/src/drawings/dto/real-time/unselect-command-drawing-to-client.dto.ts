import { IsMongoId } from 'class-validator';

export class UnselectCommandToClientDto {
    @IsMongoId()
    commandID: string;
}