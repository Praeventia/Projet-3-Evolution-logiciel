import { KeyEventMask } from './key-event-mask';

export class ColorKeyEventMask implements KeyEventMask {
    downMask: string[] = ['Escape', 'Enter', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    upMask: string[] = [];
}
