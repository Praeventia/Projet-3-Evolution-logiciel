import { Injectable } from '@angular/core';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { HttpService } from '@app/services/http/http.service';
import { SocketService } from '@app/services/socket/socket.service';

export interface ActiveUser {
    _id: string;
    username: string;
    url: string;
}

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    constructor(
        private httpService: HttpService,
        private avatarService: AvatarService,
        private socketService: SocketService,
        private drawingsService: DrawingsService,
    ) {}

    async getActiveUsersInDrawing(): Promise<ActiveUser[]> {
        if (!this.socketService.drawingConnected) {
            await new Promise((resolve) =>
                this.socketService.notifyDrawingConnected().subscribe(() => {
                    resolve(null);
                }),
            );
        }
        const drawing = this.drawingsService.getDrawingByPath();
        return this.httpService.get(`/drawings/connectedUserInDrawing/${drawing._id}`).then(async (userIds: string[]) => {
            return Promise.all(
                userIds.map(async (userId: string) => {
                    return this.httpService.get('/users/userInfo/' + userId).then((res) => {
                        return {
                            _id: userId,
                            username: res.username,
                            url: this.avatarService.userAvatarURL + res.username,
                        } as ActiveUser;
                    });
                }),
            );
        });
    }
}
