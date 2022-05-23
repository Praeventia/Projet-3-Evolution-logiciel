import {IsMongoId} from 'class-validator';

export class SelectUserIDDto {
    @IsMongoId()
    id: string;
}