import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActiveUser, UsersService } from '@app/services/users/users.service';

@Component({
    selector: 'app-active-users',
    templateUrl: './active-users.component.html',
    styleUrls: ['./active-users.component.scss'],
})
export class ActiveUsersComponent implements OnInit, OnDestroy {
    interval: number;
    constructor(private usersService: UsersService) {
        setTimeout(async () => {
            this.users = await this.usersService.getActiveUsersInDrawing();
        });
    }

    users: ActiveUser[];

    ngOnInit(): void {
        const TIMEOUT = 5000;
        this.interval = setInterval(async () => {
            this.users = await this.usersService.getActiveUsersInDrawing();
        }, TIMEOUT);
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }
}
