import { Component } from '@angular/core';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { LoginService } from '@app/services/login/login.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    constructor(
        public loginService: LoginService,
        public userService: UserService,
        public socketService: SocketService,
        public avatarService: AvatarService,
    ) {}
}
