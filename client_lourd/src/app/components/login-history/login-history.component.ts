import { Component } from '@angular/core';
import { ProfileService } from '@app/services/profile/profile.service';

@Component({
    selector: 'app-login-history',
    templateUrl: './login-history.component.html',
    styleUrls: ['./login-history.component.scss'],
})
export class LoginHistoryComponent {
    constructor(public profile: ProfileService) {}
}
