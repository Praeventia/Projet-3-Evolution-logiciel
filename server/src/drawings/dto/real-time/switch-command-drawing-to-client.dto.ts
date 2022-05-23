import { IsNumber } from 'class-validator';

export class SwitchCommandToClient {
    @IsNumber()
    commandPosition: number;

    @IsNumber()
    newPosition: number;
}