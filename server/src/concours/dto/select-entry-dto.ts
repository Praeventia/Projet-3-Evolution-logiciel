import { IsMongoId } from 'class-validator';

export class SelectConcoursEntryDto{
    @IsMongoId()
    id: string;
}