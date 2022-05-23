// tslint:disable: no-any
import { Injectable } from '@angular/core';
import { SignInForm } from '@app/components/sign-in/sign-in.component';
import { SignUpForm } from '@app/components/sign-up/sign-up.component';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { HttpService } from '@app/services/http/http.service';
import { ReturnService } from '@app/services/return/return.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { User, UserService } from '@app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        private returnService: ReturnService,
        private snackBar: SnackBarService,
        private avatarService: AvatarService,
    ) {
        this.getUserData();
    }

    async getUserData(): Promise<void> {
        const accessToken = localStorage.getItem(environment.ACCESS_TOKEN);
        const expiredAt = parseInt(localStorage.getItem(environment.EXPIRED_AT) as string, 10);
        const MS_S = 1000;
        if (!accessToken && expiredAt <= Date.now() / MS_S) {
            return;
        }
        await this.httpService
            .get('/users/userData', false)
            .then((result) => {
                this.userService.user = {
                    _id: result._id,
                    username: result.username,
                    email: result.email,
                    accessToken,
                    expiredAt,
                    url: this.avatarService.userAvatarURL + result.username,
                    emailProtected: result.isEmailProtected,
                } as User;
            })
            .catch((error) => {
                this.snackBar.openSnackBar('Veuillez vous reconnecter');
            });
    }

    async trySignIn(form: SignInForm): Promise<any> {
        await this.signIn(form);
        await this.getUserData();
        this.avatarService.chosenAvatar = this.avatarService.userAvatarURL + this.userService.user?.username;
    }

    async signIn(form: SignInForm): Promise<any> {
        await this.httpService
            .post('/connexion/login', { ...form }, false)
            .then(async (result) => {
                localStorage.setItem(environment.ACCESS_TOKEN, result.access_token);
                localStorage.setItem(environment.EXPIRED_AT, result.expired_at);
                this.returnService.return();
            })
            .catch((error) => {
                throw error;
            });
    }

    async trySignUp(form: SignUpForm): Promise<any> {
        await this.httpService
            .put('/connexion/createProfile', { ...form }, false)
            .then(async () => {
                await this.trySignIn({ email: form.email, password: form.password });
            })
            .catch((error) => {
                throw error;
            });
    }
}
