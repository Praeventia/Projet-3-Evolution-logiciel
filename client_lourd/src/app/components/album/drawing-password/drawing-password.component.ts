import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';

@Component({
    selector: 'app-drawing-password',
    templateUrl: './drawing-password.component.html',
    styleUrls: ['./drawing-password.component.scss'],
})
export class DrawingPasswordComponent {
    constructor(private httpService: HttpService, private router: Router, private dialogService: DialogService) {}

    passwordFormControl: FormControl = new FormControl('', [Validators.required]);

    async tryAccess(): Promise<void> {
        if (this.passwordFormControl.invalid) return;

        const password = this.passwordFormControl.value;

        await this.validatePassword(password).then((result) => {
            if (!result) {
                this.passwordFormControl.setValue('');
                this.passwordFormControl.setErrors({ wrongPassword: true });
            } else {
                this.dialogService.emitClose(password);
            }
        });
    }

    resetErrors(): void {
        if (this.passwordFormControl.hasError('wrongPassword')) {
            this.passwordFormControl.setErrors({ wrongPassword: null });
            this.passwordFormControl.updateValueAndValidity();
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        const drawingId = this.router.url.split('/editor/')[1];
        return await this.httpService.post('/drawings/verifyPasswordDrawing', { password, drawingID: drawingId });
    }
}
