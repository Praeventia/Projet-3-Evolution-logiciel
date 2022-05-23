import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Vec2 } from '../vec2';

export class DrawRectangleData{
    @IsString()
    strokeColor: string;
    @IsString()
    fillColor: string;
    @IsNumber()
    size: number;
    @IsBoolean()
    withStroke: boolean;
    @IsBoolean()
    withFill: boolean;
    beginning: Vec2;
    end: Vec2;
    @IsBoolean()
    isEven: boolean;

    @IsOptional()
    @IsString()
    textColor: string;
    @IsOptional()
    @IsString()
    text: string;
}