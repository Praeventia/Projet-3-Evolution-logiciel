import { IsNumber } from 'class-validator';

export class SwitchCommandFromClientDto {
    @IsNumber()
    commandPosition: number;

    @IsNumber()
    newPosition: number;
}