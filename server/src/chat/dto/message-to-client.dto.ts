import { IsString, IsNotEmpty, IsDate, IsMongoId } from 'class-validator';
export class MessageToClientDto{
    @IsNotEmpty()
    @IsDate()
    timestamp: Date;

    @IsNotEmpty()
    @IsMongoId()
    _id: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    room: string;
}