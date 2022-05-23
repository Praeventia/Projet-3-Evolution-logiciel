import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAX_USERNAME_LENGTH } from '@app/const';
import { DialogService } from '@app/services/dialog/dialog.service';
import { ProfileService } from '@app/services/profile/profile.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
@Component({
    selector: 'app-edit-info',
    templateUrl: './edit-info.component.html',
    styleUrls: ['./edit-info.component.scss'],
})
export class EditInfoComponent {
    constructor(
        public profileService: ProfileService,
        private userService: UserService,
        private snackBarService: SnackBarService,
        private dialogService: DialogService,
    ) {}

    readonly MAX_USERNAME_LENGTH: number = MAX_USERNAME_LENGTH;
    titleFormControl: FormControl = new FormControl(this.userService.user?.username, [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(MAX_USERNAME_LENGTH),
    ]);

    async tryEdit(): Promise<void> {
        if (this.titleFormControl.invalid) return;

        if (this.titleFormControl.value === this.userService.user?.username) return this.dialogService.closeAll();

        await this.profileService
            .changeUsername(this.titleFormControl.value)
            .then(() => {
                this.snackBarService.openSnackBar("nom d'utilisateur changé");
                this.dialogService.closeAll();
            })
            .catch(() => {
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
