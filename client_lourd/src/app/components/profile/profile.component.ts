import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditAvatarComponent } from '@app/components/edit-avatar/edit-avatar.component';
import { EditInfoComponent } from '@app/components/edit-info/edit-info.component';
import { LoginHistoryComponent } from '@app/components/login-history/login-history.component';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { LoginService } from '@app/services/login/login.service';
import { ProfileService } from '@app/services/profile/profile.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
    constructor(
        public userService: UserService,
        public dialog: MatDialog,
        public loginService: LoginService,
        public avatarService: AvatarService,
        public profileService: ProfileService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
    ) {
        this.profileService.init();
    }

    openEditDialog(): void {
        this.dialog.open(EditInfoComponent);
    }

    openAvatarDialog(): void {
        this.dialog.open(EditAvatarComponent);
    }

    openLoginHistory(): void {
        this.dialog.open(LoginHistoryComponent);
    }
}
