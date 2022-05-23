import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAX_ROOM_NAME } from '@app/const';
import { CanauxService } from '@app/services/canaux/canaux.service';

@Component({
    selector: 'app-create-canal',
    templateUrl: './create-canal.component.html',
    styleUrls: ['./create-canal.component.scss'],
})
export class CreateCanalComponent {
    constructor(public canauxService: CanauxService) {}

    readonly MAX_TITLE_SIZE: number = MAX_ROOM_NAME;
    titleFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_TITLE_SIZE),
    ]);

    async tryCreate(): Promise<void> {
        if (!this.titleFormControl.valid) return;
        const name = this.titleFormControl.value;
        await this.canauxService.tryCreate(name).catch(() => {
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
