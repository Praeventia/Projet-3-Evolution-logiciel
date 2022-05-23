import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAX_DRAWING_NAME } from '@app/const';
import { Drawing } from '@app/services/album/album.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';

@Component({
    selector: 'app-create-drawing',
    templateUrl: './create-drawing.component.html',
    styleUrls: ['./create-drawing.component.scss'],
})
export class CreateDrawingComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public drawingsService: DrawingsService) {}

    readonly MAX_TITLE_SIZE: number = MAX_DRAWING_NAME;
    titleFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_TITLE_SIZE),
    ]);

    passwordFormControl: FormControl = new FormControl('', [Validators.required]);

    enablePassword: FormControl = new FormControl(false);

    async tryCreate(): Promise<void> {
        if (this.titleFormControl.invalid) return;

        const name = this.titleFormControl.value;

        const drawing = {
            name,
            isOwner: true,
            album: this.data.album,
        } as Drawing;

        const password = this.enablePassword.value === true ? this.passwordFormControl.value : null;

        await this.drawingsService.createDrawing(drawing, password).catch((error) => {
            console.error(error);
            this.titleFormControl.setValue('');
            this.titleFormControl.setErrors({ conflict: true });
        });
    }

    resetErrors(): void {
        if (this.titleFormControl.hasError('conflict')) {
            this.titleFormControl.setErrors({ conflict: null });
            this.titleFormControl.updateValueAndValidity();
        }
    }
}
