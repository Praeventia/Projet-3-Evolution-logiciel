import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '@app/services/login/login.service';
import { ReturnService } from '@app/services/return/return.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
    @Input() pageTitle: string = '';
    @Input() pageUrl: string = '';
    constructor(public loginService: LoginService, public router: Router, public returnService: ReturnService, public userService: UserService) {}
}
