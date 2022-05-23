import { Vec2 } from '@app/classes/vec2';
export class DrawRectangleData {
    strokeColor: string;
    fillColor: string;
    size: number;
    withStroke: boolean;
    withFill: boolean;
    isEven: boolean;
    beginning: Vec2;
    end: Vec2;
    text: string;
    textColor: string;
}
