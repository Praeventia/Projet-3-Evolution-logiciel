import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_SNACKBAR_TIME, SNACKBAR_SOUND } from '@app/const';

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(private snackBar: MatSnackBar) {}
    openSnackBar(message: string): void {
        this.snackBar.open(message, '✖', {
            duration: DEFAULT_SNACKBAR_TIME,
        });
        SNACKBAR_SOUND.play();
    }
}
