import { IsNumber, IsString } from 'class-validator';
import { Vec2 } from '../vec2';



export class DrawPencilData {
    pathData: Vec2[];
    @IsString()
    color: string;
    @IsNumber()
    size: number;

}