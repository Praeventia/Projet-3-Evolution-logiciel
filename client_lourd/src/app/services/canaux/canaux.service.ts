import { Injectable } from '@angular/core';
import { HTTP_BAD_REQUEST, HTTP_STATUS_CONFLICT } from '@app/const';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { ChatService } from '@app/services/chat/chat.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { Observable, Subject } from 'rxjs';

export interface Canal {
    name: string;
    joined: boolean;
    main: boolean;
    drawing: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class CanauxService {
    constructor(
        private dialogService: DialogService,
        private httpService: HttpService,
        private chatService: ChatService,
        private snackBarService: SnackBarService,
        private socketService: SocketService,
        private chatHandlerService: ChatHandlerService,
        private userService: UserService,
    ) {
        this.socketService.notifyChatConnected().subscribe(async () => {
            // tslint:disable-next-line: no-any
            this.socketService.chatSocket?.on('exception', (error: any) => {
                if (error.statusCode === HTTP_BAD_REQUEST.toString() && error.message === "Room don't exist") {
                    this.snackBarService.openSnackBar('Le canal à été supprimé');
                    this.leave();
                }
            });
            await this.updateCanaux(false);
        });

        this.socketService.notifyChatDisconnected().subscribe(() => {
            this.disconnect();
        });

        this.chatHandlerService.notifyChatVisibilityChange().subscribe(async () => {
            await this.updateCanaux(true);
        });

        this.socketService.notifyDrawingConnected().subscribe(async () => {
            this.updateCanaux(true);
        });
        this.socketService.notifyDrawingDisconnected().subscribe(async () => {
            this.updateCanaux(true);
            if (this.chatHandlerService.currentCanal?.drawing) this.chatHandlerService.isInChat = false;
        });
    }

    get joinedCanaux(): Canal[] {
        return this.canaux.filter((canal) => canal.joined);
    }
    get pinnedCanaux(): Canal[] {
        return this.joinedCanaux.filter((canal) => canal.main || canal.drawing);
    }
    get otherCanaux(): Canal[] {
        return this.joinedCanaux.filter((canal) => !canal.main && !canal.drawing);
    }

    canaux: Canal[] = [];

    private canalUpdate: Subject<void> = new Subject<void>();

    private isInCHatUpdate: Subject<void> = new Subject<void>();

    canauxLoading: boolean = false;

    quitLoading: boolean = false;

    private disconnect(): void {
        this.chatHandlerService.currentCanal = undefined;
        this.chatHandlerService.isInChat = false;
        this.canaux = [];
    }

    notifyWhenCanalUpdate(): Observable<void> {
        return this.canalUpdate.asObservable();
    }
    private emitCanalUpdate(): void {
        this.canalUpdate.next();
    }

    notifyIsInChat(): Observable<void> {
        return this.isInCHatUpdate.asObservable();
    }
    private emitIsInChat(): void {
        this.isInCHatUpdate.next();
    }

    async delete(event: Event, name: string): Promise<void> {
        event.stopPropagation();
        await this.httpService
            .post('/rooms/deleteRoom', { roomName: name })
            .then(async () => {
                await this.updateCanaux(false);
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de supprimer le canal');
                this.updateCanaux(false);
            });
    }

    async updateCanaux(silent: boolean): Promise<void> {
        if (!this.socketService.chatConnected || !this.userService.userConnected) return;
        this.canauxLoading = !silent;
        const canauxAccessible: string[] = await this.httpService.get('/rooms/allRoomsJoin').catch(() => []);
        await this.httpService
            .get('/rooms/allRooms')
            .then((canaux) => {
                this.canaux = canaux.map((canal: string) => {
                    return { name: canal, joined: canauxAccessible.includes(canal), main: canal === 'Principal' } as Canal;
                });
                if (this.socketService.drawingConnected) {
                    this.canaux.push({ name: 'Dessin', joined: true, main: false, drawing: true });
                }
            })
            .catch((error) => {
                if (!this.socketService.chatConnected) return;
                this.snackBarService.openSnackBar('Impossible de récupérer les canaux');
            })
            .finally(() => {
                this.canauxLoading = false;
                this.quitLoading = true;
                this.emitCanalUpdate();
            });
    }

    async tryCreate(name: string): Promise<void> {
        if (!this.socketService.chatConnected) return;
        await this.httpService
            .put('/rooms/createRoom', { roomName: name })
            .then(() => {
                this.addCanal(name);
            })
            .catch((error) => {
                if (error.status === HTTP_STATUS_CONFLICT) {
                    throw error;
                }
                this.addCanal(name);
            });
    }

    private addCanal(name: string): void {
        this.canaux.push({ name: name as string, joined: true, main: false, drawing: false });
        this.emitCanalUpdate();
        this.dialogService.closeAll();
    }

    private getCanal(name: string): Canal | undefined {
        return this.canaux.find((canal) => canal.name === name);
    }

    async view(name: string): Promise<void> {
        if (!this.socketService.chatConnected) return;
        this.chatHandlerService.currentCanal = this.getCanal(name);
        this.chatService.clearNotifications(this.chatHandlerService.currentCanal?.name as string);
        if (!this.chatHandlerService.currentCanal?.joined) await this.join(name);
        this.chatHandlerService.isInChat = true;
        this.emitIsInChat();
    }

    leave(): void {
        this.chatService.clearNotifications(this.chatHandlerService.currentCanal?.name as string);

        this.chatHandlerService.currentCanal = undefined;
        this.chatHandlerService.isInChat = false;

        this.updateCanaux(true);
    }
    async join(name: string): Promise<void> {
        if (!this.socketService.chatConnected) return;
        const canal = this.getCanal(name);
        await this.httpService
            .put('/rooms/addUserToRoom', { roomName: canal?.name })
            .then(() => {
                (canal as Canal).joined = true;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de rejoindre le canal');
                this.updateCanaux(false);
            });
        await this.chatService.getMessageInRoom(name);
    }
    async quit(event: Event, name: string): Promise<void> {
        event.stopPropagation();
        if (!this.socketService.chatConnected) return;
        const canal = this.getCanal(name);
        this.quitLoading = true;
        await this.httpService
            .post('/rooms/removeUserFromRoom', { roomName: canal?.name })
            .then(async () => {
                await this.updateCanaux(true);
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de quitter le canal');
                this.updateCanaux(false);
            })
            .finally(() => {
                this.quitLoading = false;
            });
        this.chatService.leaveRoom(name);
    }
}
