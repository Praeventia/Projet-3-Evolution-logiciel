import { IsString, IsNotEmpty } from 'class-validator';
export class MessageFromClientDrawingDto{
    @IsNotEmpty()
    @IsString()
    message: string;
}