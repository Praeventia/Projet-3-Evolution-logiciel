import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { DialogKeyEventMask } from '@app/classes/key-event-masks/dialog-key-event-mask';
import { EditAvatarComponent } from '@app/components/edit-avatar/edit-avatar.component';
import { HTTP_STATUS_CONFLICT, MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH, NULL_INDEX } from '@app/const';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LoginService } from '@app/services/login/login.service';
import { ReturnService } from '@app/services/return/return.service';
import { SocketService } from '@app/services/socket/socket.service';
export interface SignUpForm {
    username: string;
    email: string;
    password: string;
}

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {
    readonly MIN_PASS_LEN: number = 6;

    hide: boolean = true;

    usernameFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(MAX_USERNAME_LENGTH),
        Validators.minLength(MIN_USERNAME_LENGTH),
    ]);

    emailFormControl: FormControl = new FormControl('', [Validators.required, Validators.email]);
    passwordFormControl: FormControl = new FormControl('');

    // tslint:disable-next-line:no-empty
    constructor(
        public loginService: LoginService,
        private keyEventService: KeyEventService,
        public dialog: MatDialog,
        public avatarService: AvatarService,
        private returnService: ReturnService,
        private socketService: SocketService,
        private router: Router,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            return this.returnService.return();
        });
        this.keyEventService.getKeyDownEvent('Enter').subscribe(async (event) => {
            if (
                this.passwordFormControl.invalid ||
                this.emailFormControl.invalid ||
                this.usernameFormControl.invalid ||
                !this.router.url.includes('/signup')
            )
                return;
            await this.accept();
        });
    }

    async accept(): Promise<void> {
        const form = {
            username: this.usernameFormControl.value,
            email: this.emailFormControl.value,
            password: this.passwordFormControl.value,
        } as SignUpForm;

        await this.loginService
            .trySignUp(form)
            .then(async () => {
                if (this.avatarService.chosenDefaultIndex !== NULL_INDEX) {
                    await this.avatarService.changeToDefaultAvatar();
                } else {
                    await this.avatarService.changeToCustomAvatar();
                }
            })
            .catch((error) => {
                if (error.error.statusCode === HTTP_STATUS_CONFLICT && error.error.message === "Le nom d'utilisateur est déjà présent") {
                    this.usernameFormControl.setErrors({ username_taken: true });
                } else if (error.error.statusCode === HTTP_STATUS_CONFLICT && error.error.message === 'Le courriel est déjà présent') {
                    this.emailFormControl.setErrors({ email_taken: true });
                }
            });
    }

    openAvatarDialog(): void {
        this.dialog.open(EditAvatarComponent);
    }

    ngOnInit(): void {
        this.keyEventService.keyMask = new DialogKeyEventMask();
        this.avatarService.chosenAvatar = 'https://backendpi3.fibiess.com/users/defaultAvatar/default_01.png';
        this.avatarService.chosenDefaultIndex = 0;
    }

    ngOnDestroy(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }
}
