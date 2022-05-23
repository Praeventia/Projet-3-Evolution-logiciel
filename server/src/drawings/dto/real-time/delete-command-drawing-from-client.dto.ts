import { IsMongoId } from 'class-validator';

export class DeleteCommandFromClientDto {
    @IsMongoId()
    commandID: string;
}