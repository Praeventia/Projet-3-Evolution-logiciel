import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
    _id: string;
    username: string;
    email: string;
    accessToken: string;
    expiredAt: number;
    emailProtected: boolean;
    url: string;
}

// tslint:disable-next-line: no-any
let ipcRenderer: any;
// tslint:disable-next-line: no-any
const userAgent = navigator.userAgent.toLowerCase();
// tslint:disable-next-line
if (userAgent.indexOf(' electron/') > -1) ipcRenderer = (window as any).require('electron').ipcRenderer;

@Injectable({
    providedIn: 'root',
})
export class UserService {
    get user(): User | undefined {
        return this.userObject;
    }

    set user(user: User | undefined) {
        this.userObject = user;
        if (user !== undefined) this.emitUserConnected();
    }

    constructor(private snackBarService: SnackBarService, private router: Router, private http: HttpClient) {
        ipcRenderer?.once('external-chat-disconnected', () => {
            this.disconnectUser();
        });
    }

    get userConnected(): boolean {
        const MS_S = 1000;
        return this.user !== undefined && (this.user?.expiredAt as number) > Date.now() / MS_S;
    }
    private userObject: User | undefined = undefined;

    userConnectedSubject: Subject<void> = new Subject<void>();
    userDisconnectedSubject: Subject<void> = new Subject<void>();

    async waitForConnexion(): Promise<void> {
        return new Promise((resolve, _) => {
            if (this.userConnected) {
                return resolve();
            }

            this.notifyWhenUserConnected().subscribe(() => {
                return resolve();
            });
        });
    }

    notifyWhenUserConnected(): Observable<void> {
        return this.userConnectedSubject.asObservable();
    }

    private emitUserConnected(): void {
        this.userConnectedSubject.next();
    }

    notifyWhenUserDisconnected(): Observable<void> {
        return this.userDisconnectedSubject.asObservable();
    }

    private emitUserDisconnected(): void {
        this.userDisconnectedSubject.next();
    }

    async disconnectUser(): Promise<void> {
        if (this.user !== undefined) {
            this.user = undefined;
            await this.http
                .post(environment.SERVER_BASE + '/connexion/disconnect', {})
                .toPromise()
                .then((result) => {
                    this.snackBarService.openSnackBar('vous êtes déconnecté');
                })
                .catch((error) => {
                    this.snackBarService.openSnackBar('vous avez été déconnecté');
                })
                .finally(() => {
                    localStorage.removeItem(environment.ACCESS_TOKEN);
                    localStorage.removeItem(environment.EXPIRED_AT);
                    if (this.router.url === '/chat') ipcRenderer.send('external-chat-disconnected');
                    this.router.navigate(['/home']);
                    this.emitUserDisconnected();
                });
        }
    }
}
