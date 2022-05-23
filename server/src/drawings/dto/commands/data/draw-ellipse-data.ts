
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Vec2 } from '../vec2';

export class DrawEllipseData {
    @IsBoolean()
    drawPreview: boolean;
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
    @IsBoolean()
    isEven: boolean;
    beginning: Vec2;
    end: Vec2;

    @IsOptional()
    @IsString()
    textColor: string;
    @IsOptional()
    @IsString()
    text: string;
}
