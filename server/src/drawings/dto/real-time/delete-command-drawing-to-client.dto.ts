import { IsMongoId } from 'class-validator';

export class DeleteCommandToClientDto {
    @IsMongoId()
    commandID: string;
    @IsMongoId()
    userID: string;
}