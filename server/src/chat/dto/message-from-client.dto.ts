import { IsString, IsNotEmpty } from 'class-validator';
export class MessageFromClientDto{
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    room: string;
}