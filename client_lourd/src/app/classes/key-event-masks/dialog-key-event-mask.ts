import { KeyEventMask } from './key-event-mask';

export class DialogKeyEventMask implements KeyEventMask {
    downMask: string[] = ['Escape', 'Enter', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    upMask: string[] = [];
}
