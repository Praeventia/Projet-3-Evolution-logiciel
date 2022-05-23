import { IsMongoId } from 'class-validator';

export class SelectCommandToClientDto {
    @IsMongoId()
    commandID: string;
    @IsMongoId()
    userID: string;
}