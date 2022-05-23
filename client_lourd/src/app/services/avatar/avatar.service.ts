// tslint:disable: no-any
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NULL_INDEX } from '@app/const';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';

@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    defaultAvatarsID: string[] = [];
    chosenAvatar: any;
    avatarFormData: FormData;
    chosenDefaultIndex: number;
    croppedImage: any;
    userAvatarURL: string = 'https://backendpi3.fibiess.com/users/avatar/';
    defaultAvatarURL: string = 'https://backendpi3.fibiess.com/users/defaultAvatar/';

    constructor(
        public httpService: HttpService,
        public snackBar: SnackBarService,
        public userService: UserService,
        public dialog: MatDialog,
        public socketService: SocketService,
    ) {
        this.getDefaultAvatars();
        this.socketService.notifyChatConnected().subscribe(() => {
            this.chosenAvatar = this.userAvatarURL + this.userService.user?.username;
        });
    }

    async setDefaultAvatar(index: number): Promise<void> {
        this.chosenAvatar = this.defaultAvatarURL + this.defaultAvatarsID[index];
        this.chosenDefaultIndex = index;
        await this.changeToDefaultAvatar();
        this.dialog.closeAll();
    }

    async setCustomAvatar(formData: FormData, croppedImage: any): Promise<void> {
        this.croppedImage = croppedImage;
        this.chosenAvatar = croppedImage;
        this.avatarFormData = formData;
        this.chosenDefaultIndex = NULL_INDEX;
        await this.changeToCustomAvatar();
        this.dialog.closeAll();
    }

    async getDefaultAvatars(): Promise<any> {
        await this.httpService
            .get('/users/allDefaultAvatar', false)
            .then(async (result: string[]) => {
                this.defaultAvatarsID = result;
            })
            .catch((error: any) => {
                throw error;
            });
    }

    async changeToDefaultAvatar(): Promise<any> {
        if (this.userService.user !== undefined) {
            await this.httpService
                .put('/users/changeToDefaultAvatar?defaultAvatar=' + this.defaultAvatarsID[this.chosenDefaultIndex], null, true)
                .then(async () => {
                    this.chosenAvatar = this.defaultAvatarURL + this.defaultAvatarsID[this.chosenDefaultIndex];
                })
                .catch((error) => {
                    this.chosenAvatar = this.userAvatarURL + this.userService.user?.username;
                    this.snackBar.openSnackBar("Une erreur c'est produite lors du changement d'avatar");
                    throw error;
                });
        }
    }

    async changeToCustomAvatar(): Promise<any> {
        if (this.userService.user !== undefined) {
            await this.httpService
                .put('/users/changeAvatar', this.avatarFormData, true)
                .then(async () => {
                    this.chosenAvatar = this.croppedImage;
                })
                .catch((error) => {
                    this.chosenAvatar = this.userAvatarURL + this.userService.user?.username;
                    this.snackBar.openSnackBar("Une erreur c'est produite lors du changement d'avatar");
                    throw error;
                });
        }
    }
}
