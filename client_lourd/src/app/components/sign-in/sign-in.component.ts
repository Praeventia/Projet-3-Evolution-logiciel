import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { DialogKeyEventMask } from '@app/classes/key-event-masks/dialog-key-event-mask';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LoginService } from '@app/services/login/login.service';
import { ReturnService } from '@app/services/return/return.service';
import { SocketService } from '@app/services/socket/socket.service';

export interface SignInForm {
    email: string;
    password: string;
}
@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit, OnDestroy {
    hide: boolean = true;

    emailFormControl: FormControl = new FormControl('', [Validators.required, Validators.email]);
    passwordFormControl: FormControl = new FormControl('', [Validators.required]);

    // tslint:disable-next-line:no-empty
    constructor(
        public loginService: LoginService,
        private keyEventService: KeyEventService,
        private socketService: SocketService,
        private returnService: ReturnService,
        private router: Router,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            return this.returnService.return();
        });

        this.keyEventService.getKeyDownEvent('Enter').subscribe(async (event) => {
            if (this.passwordFormControl.invalid || this.emailFormControl.invalid || !this.router.url.includes('/signin')) return;
            await this.connect();
        });
    }

    async connect(): Promise<void> {
        const form = {
            email: this.emailFormControl.value,
            password: this.passwordFormControl.value,
        } as SignInForm;

        await this.loginService.trySignIn(form).catch((error) => {
            this.passwordFormControl.setValue('');
            this.passwordFormControl.setErrors({ auth_incorrect: true });

            this.emailFormControl.setValue('');
            this.emailFormControl.setErrors({ auth_incorrect: true });
        });
    }

    ngOnInit(): void {
        this.keyEventService.keyMask = new DialogKeyEventMask();
    }
    ngOnDestroy(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }

    resetErrors(): void {
        if (this.emailFormControl.hasError('auth_incorrect')) {
            this.emailFormControl.setErrors({ auth_incorrect: null });
            this.emailFormControl.updateValueAndValidity();
        }

        if (this.passwordFormControl.hasError('auth_incorrect')) {
            this.passwordFormControl.setErrors({ auth_incorrect: null });
            this.passwordFormControl.updateValueAndValidity();
        }
    }
}
