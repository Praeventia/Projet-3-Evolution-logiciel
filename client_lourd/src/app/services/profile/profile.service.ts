// tslint:disable: no-any
// tslint:disable: prefer-for-of
import { Injectable } from '@angular/core';
import { AlbumService, Drawing } from '@app/services/album/album.service';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { HttpService } from '@app/services/http/http.service';
import { LoginService } from '@app/services/login/login.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { User, UserService } from '@app/services/user/user.service';
// tslint:disable

export interface Item {
    name: string;
    value: any;
}
export interface Connection {
    type: string;
    time: string;
    dateObj: Date;
}

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        public loginService: LoginService,
        public snackBar: SnackBarService,
        public avatarService: AvatarService,
        public albumService: AlbumService,
        private drawingsService: DrawingsService,
    ) {}

    async init(): Promise<void> {
        this.userService.waitForConnexion().then(async () => {
            await this.drawingsService.init(true);
            this.getAllInfos();
        });
    }
    connectionHistory: Connection[] = [];
    lastLogin: string;
    lastDeconnection: string;
    totalCollabTime: string;
    averageCollabTime: string;
    messagesSent: number;
    totalPixels: number;
    privateAlbums: number;
    drawingsOwned: number;
    emailProtected: boolean;
    drawingHistory: Drawing[] = [];

    isLoading: boolean = false;

    async getAllInfos(): Promise<void> {
        this.isLoading = true;
        if (this.userService.user !== undefined) {
            this.emailProtected = this.userService.user.emailProtected;
        }
        await Promise.all([
            this.getUserLoginHistory(),
            this.getUserLogoutHistory(),
            this.getAverageCollaborationTime(),
            this.getTotalCollaborationTime(),
            this.getTotalMessagesSent(),
            this.getTotalPixels(),
            this.getPrivateAlbums(),
            this.getAllDrawingsOwned(),
            this.getRecentDrawings(),
        ]);
        this.orderTimeStamps();

        this.isLoading = false;
    }

    async changeUsername(newUser: string): Promise<any> {
        await this.httpService
            .put('/users/changeUsername', { username: newUser }, true)
            .then(async (result) => {
                if (result && this.userService.user != undefined) {
                    this.userService.user.username = newUser;
                }
            })
            .catch((error) => {
                this.snackBar.openSnackBar("Une erreur c'est produite lors du changement de pseudonyme");
                throw error;
            });
    }

    async getTotalCollaborationTime(): Promise<any> {
        await this.httpService
            .get('/users/userTotalCollaborationTime', true)
            .then(async (result) => {
                this.totalCollabTime = this.formatSecondsToTime(result);
            })
            .catch((error) => {
                this.snackBar.openSnackBar('Erreur lors du chargement du temps de collaboration total');
                throw error;
            });
    }

    async getAverageCollaborationTime(): Promise<any> {
        await this.httpService
            .get('/users/userAverageCollaborationTime', true)
            .then(async (result) => {
                this.averageCollabTime = this.formatSecondsToTime(result);
            })
            .catch((error) => {
                this.snackBar.openSnackBar('Erreur lors du chargement du temps moyen de collaboration');
                throw error;
            });
    }

    async getUserLoginHistory(): Promise<any> {
        await this.httpService
            .get('/users/userLoginTime', true)
            .then(async (result: string[]) => {
                this.connectionHistory = [];
                for (let i = 0; i < result.length; i++) {
                    this.connectionHistory.push({
                        type: 'Connexion',
                        time: new Date(result[i]).toLocaleString(),
                        dateObj: new Date(result[i]),
                    } as Connection);
                }
                this.lastLogin = new Date(result[result.length - 1]).toLocaleString();
            })
            .catch((error) => {
                this.snackBar.openSnackBar("Erreur lors du chargement de l'historique de connexion");
                throw error;
            });
    }

    async getUserLogoutHistory(): Promise<any> {
        await this.httpService
            .get('/users/userDisconnectTime', true)
            .then(async (result: string[]) => {
                for (let i = 0; i < result.length; i++) {
                    this.connectionHistory.push({
                        type: 'Déconnexion',
                        time: new Date(result[i]).toLocaleString(),
                        dateObj: new Date(result[i]),
                    } as Connection);
                }
                if (result.length > 0) {
                    this.lastDeconnection = new Date(result[result.length - 1]).toLocaleString();
                }
            })
            .catch((error) => {
                this.snackBar.openSnackBar("Erreur lors du chargement de l'historique de déconnexion");
                throw error;
            });
    }

    async getTotalMessagesSent(): Promise<any> {
        await this.httpService
            .get('/users/numberOfMessageSentUser', true)
            .then(async (result: number) => {
                this.messagesSent = result;
            })
            .catch((error) => {
                this.snackBar.openSnackBar('Erreur lors du chargement du nombre de messsages envoyés');
                throw error;
            });
    }

    async getTotalPixels(): Promise<any> {
        await this.httpService
            .get('/users/numberOfPixelCrossUser', true)
            .then(async (result: number) => {
                this.totalPixels = result;
            })
            .catch((error) => {
                this.snackBar.openSnackBar('Erreur lors du chargement du nombre de pixels parcourus');
                throw error;
            });
    }

    getPrivateAlbums(): any {
        this.privateAlbums = this.albumService.joinedAlbums.filter((album) => !album.isPublic).length;
    }

    async getAllDrawingsOwned(): Promise<any> {
        await this.httpService
            .get('/drawings/allDrawingOwnByUser', true)
            .then(async (result: any[]) => {
                this.drawingsOwned = result.length;
            })
            .catch((error) => {
                this.snackBar.openSnackBar('Erreur lors du chargement du nombre de dessins créés');
                throw error;
            });
    }

    async getRecentDrawings(): Promise<void> {
        const drawingHistory: Drawing[] = [];
        await this.httpService.get('/drawings/recentDrawingEdited').then(async (result: any[]) => {
            return result.map((drawing) => {
                const drawingById = this.drawingsService.getDrawingById(drawing._id);
                if (drawingById) drawingHistory.push(drawingById);
            });
        });

        this.drawingHistory = drawingHistory;
    }

    async toggleEmail(): Promise<any> {
        await this.httpService.put('/users/changeEmailProtection', true).then(() => {
            this.userService.user = {
                ...this.userService.user,
                emailProtected: !this.userService.user?.emailProtected,
            } as User;
        });
    }

    formatSecondsToTime(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / (60 * 60));
        const divisor_for_minutes = totalSeconds % (60 * 60);
        const minutes = Math.floor(divisor_for_minutes / 60);
        const divisor_for_seconds = divisor_for_minutes % 60;
        const seconds = Math.ceil(divisor_for_seconds);

        return (
            hours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            'h' +
            minutes.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            'm' +
            seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            's'
        );
    }
    orderTimeStamps(): void {
        this.connectionHistory = this.connectionHistory.sort((time1, time2) => time2.dateObj.getTime() - time1.dateObj.getTime());
    }
}
