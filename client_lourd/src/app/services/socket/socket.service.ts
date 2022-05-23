import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HTTP_BAD_REQUEST, HTTP_STATUS_UNAUTHORIZED } from '@app/const';
import { Drawing } from '@app/services/album/album.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    constructor(private userService: UserService, private router: Router, private snackbarService: SnackBarService) {
        this.userService.notifyWhenUserConnected().subscribe(() => {
            this.connectChat();
        });

        this.userService.notifyWhenUserDisconnected().subscribe(() => {
            this.disconnectChat(true);
            this.disconnectDrawing();
        });
    }

    get chatConnected(): boolean {
        return this.chatSocket?.ioSocket.connected;
    }

    get drawingConnected(): boolean {
        return this.drawingSocket?.ioSocket.connected;
    }

    chatSocket: Socket | undefined;

    private chatDisconnectedSubject: Subject<boolean> = new Subject<boolean>();

    private chatConnectedSubject: Subject<void> = new Subject<void>();

    drawingSocket: Socket | undefined;

    private drawingDisconnectedSubject: Subject<boolean> = new Subject<boolean>();

    private drawingConnectedSubject: Subject<Drawing> = new Subject<Drawing>();

    notifyChatDisconnected(): Observable<boolean> {
        return this.chatDisconnectedSubject.asObservable();
    }

    private emitChatDisconnected(): void {
        this.chatDisconnectedSubject.next(true);
    }

    notifyChatConnected(): Observable<void> {
        return this.chatConnectedSubject.asObservable();
    }

    private emitChatConnected(): void {
        this.chatConnectedSubject.next();
    }

    connectChat(): void {
        if (this.chatConnected) return;

        this.chatSocket = new Socket({ url: environment.SERVER_BASE, options: { autoConnect: false, path: '/chat' } });
        this.chatSocket.ioSocket.io.opts.query = { Authorization: this.userService.user?.accessToken };
        this.chatSocket.connect();

        this.chatSocket.on('connect', () => {
            console.log('Connected to chat');
            this.emitChatConnected();
        });

        this.chatSocket.on('disconnect', () => {
            this.onDisconnectedFromChat();
        });
    }

    onDisconnectedFromChat(): void {
        this.userService.disconnectUser();
        this.emitChatDisconnected();
    }

    async disconnectChat(silent: boolean): Promise<void> {
        await new Promise((resolve) => {
            if (silent) this.chatSocket?.removeAllListeners();

            this.chatSocket?.on('disconnect', () => {
                if (!silent) this.onDisconnectedFromChat();
                resolve(undefined);
            });
            this.chatSocket?.disconnect();
        });
    }

    notifyDrawingDisconnected(): Observable<boolean> {
        return this.drawingDisconnectedSubject.asObservable();
    }

    private emitDrawingDisconnected(): void {
        this.drawingDisconnectedSubject.next(true);
    }

    notifyDrawingConnected(): Observable<Drawing> {
        return this.drawingConnectedSubject.asObservable();
    }

    private emitDrawingConnected(drawing: Drawing): void {
        this.drawingConnectedSubject.next(drawing);
    }

    async connectDrawing(drawing: Drawing, password?: string): Promise<void> {
        if (this.drawingConnected) return;
        this.drawingSocket = new Socket({ url: environment.SERVER_BASE, options: { autoConnect: false, path: '/drawing' } });
        this.drawingSocket.ioSocket.io.opts.query = {
            Authorization: this.userService.user?.accessToken,
            drawingID: drawing._id,
            password,
        };
        this.drawingSocket.connect();

        this.drawingSocket.on('disconnect', () => {
            this.onDisconnectedFromDrawing();
        });

        this.drawingSocket?.on('exception', (error: any) => {
            if (error.statusCode === HTTP_BAD_REQUEST.toString() || error.statusCode === HTTP_STATUS_UNAUTHORIZED.toString()) {
                this.router.navigate(['/home']);
                this.snackbarService.openSnackBar('Vous avez été déconnecté du dessins.');
                return;
            }
            this.snackbarService.openSnackBar(error.message);
        });

        return new Promise((resolve) => {
            this.drawingSocket?.on('connect', () => {
                this.emitDrawingConnected(drawing);
                console.log('Connected to drawing');
                resolve(undefined);
            });
        });
    }

    onDisconnectedFromDrawing(): void {
        this.emitDrawingDisconnected();
        console.log('Disconnected from drawing');
    }

    disconnectDrawing(): void {
        this.drawingSocket?.disconnect();
    }
}
