import { IsNumber } from 'class-validator';

export class Vec2 {
    @IsNumber()
    x: number;
    @IsNumber()
    y: number;
}
