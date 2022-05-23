import { IsMongoId } from 'class-validator';

export class UnselectCommandFromClientDto {
    @IsMongoId()
    commandID: string;
}