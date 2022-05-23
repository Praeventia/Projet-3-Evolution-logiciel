// tslint:disable-next-line: no-relative-imports
// tslint:disable: no-any
import { Injectable } from '@angular/core';
// tslint:disable-next-line: no-relative-imports
import {
    MESSAGE_FROM_SERVER,
    MESSAGE_FROM_SERVER_IN_DRAWING,
    MESSAGE_TO_SERVER,
    MESSAGE_TO_SERVER_IN_DRAWING,
    USER_CONNECTED,
    USER_DISCONNECTED,
} from '@app/../../../shared/communication/chat/const';
import { Message, MessageType } from '@app/classes/message';
import { notificationSound } from '@app/const';
import { Drawing } from '@app/services/album/album.service';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { Observable, Subject } from 'rxjs';

export interface CanalMessages {
    notifications: number;
    messages: Message[];
}
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    get messages(): Message[] {
        return this.messagesRoom.get(this.chatHandlerService.currentCanal?.name as string)?.messages ?? [];
    }

    constructor(
        private userService: UserService,
        public httpService: HttpService,
        private snackBarService: SnackBarService,
        private socketService: SocketService,
        private chatHandlerService: ChatHandlerService,
        private avatarService: AvatarService,
    ) {
        this.socketService.notifyChatConnected().subscribe(async () => {
            this.socketService.chatSocket?.fromEvent(MESSAGE_FROM_SERVER).subscribe((message: Message) => {
                if (message.username !== this.userService.user?.username) {
                    const myAudio = new Audio(notificationSound);
                    myAudio.play();
                }
                this.receiveMessage(message);
            });
            this.socketService.chatSocket?.fromEvent(USER_CONNECTED).subscribe((username: string) => {
                this.userConnected(username);
            });
            this.socketService.chatSocket?.fromEvent(USER_DISCONNECTED).subscribe((username: string) => {
                this.userDisconnected(username);
            });
            await this.getAllMessages();
        });

        this.socketService.notifyChatDisconnected().subscribe(() => {
            this.disconnect();
        });

        this.socketService.notifyDrawingConnected().subscribe(async (drawing: Drawing) => {
            this.socketService.drawingSocket?.fromEvent(MESSAGE_FROM_SERVER_IN_DRAWING).subscribe((message: Message) => {
                this.receiveMessage(message);
            });
            await this.getRoomMessages(drawing._id);
        });
    }

    private newMessage: Subject<void> = new Subject<void>();

    private messagesRoom: Map<string, CanalMessages> = new Map<string, CanalMessages>();

    loadingChat: boolean = false;

    getNotifications(room: string): number {
        return this.messagesRoom.get(room)?.notifications ?? 0;
    }

    disconnect(): void {
        this.messagesRoom = new Map<string, CanalMessages>();
    }

    leaveRoom(room: string): void {
        if (this.messagesRoom.has(room)) {
            this.messagesRoom.delete(room);
        }
    }
    private async getAllMessages(): Promise<void> {
        if (!this.socketService.chatConnected || !this.userService.userConnected) return;
        const canaux: string[] = await this.httpService.get('/rooms/allRoomsJoin');
        this.loadingChat = true;

        await Promise.all(canaux.map((canal: string) => this.getMessageInRoom(canal)));

        this.loadingChat = false;
    }

    async getMessageInRoom(room: string): Promise<any> {
        this.leaveRoom(room);
        return await this.httpService
            .get(`/rooms/allMessagesInRoom/${room}`)
            .then((messages) => {
                messages.forEach((message: any) => {
                    this.receiveMessage({
                        ...message,
                        room,
                        fromFetch: true,
                    } as Message);
                });
            })
            .catch((error: Error) => {
                this.snackBarService.openSnackBar('Impossible de récupérer les messages pour le canal ' + room);
            })
            .finally(() => {
                this.emitNewMessage();
            });
    }

    async getRoomMessages(drawingId: string): Promise<void> {
        if (!this.socketService.chatConnected) return;

        const messages: Message[] = await this.httpService.get(`/drawings/allMessagesInDrawing/${drawingId}`);
        if (messages.length === 0) return;

        messages.forEach((message: Message) => {
            this.receiveMessage(message);
        });
    }

    notifyWhenNewMessages(): Observable<void> {
        return this.newMessage.asObservable();
    }

    sendMessage(messageToSend: string): void {
        if (!this.socketService.chatConnected) {
            this.snackBarService.openSnackBar("Le chat n'est pas connecté");
            return;
        }
        if (!this.chatHandlerService.currentCanal?.drawing) {
            this.socketService.chatSocket?.emit(MESSAGE_TO_SERVER, {
                message: messageToSend,
                room: this.chatHandlerService.currentCanal?.name as string,
            });
        } else {
            this.socketService.drawingSocket?.emit(MESSAGE_TO_SERVER_IN_DRAWING, {
                message: messageToSend,
            });
        }
    }

    private pushMessage(message: Message): void {
        this.messagesRoom.set(message.room, {
            messages: [...(this.messagesRoom.get(message.room)?.messages ?? []), message],
            notifications: message.fromFetch ? 0 : (this.messagesRoom.get(message.room)?.notifications ?? 0) + 1,
        } as CanalMessages);
        this.emitNewMessage();
    }

    private emitNewMessage(): void {
        this.newMessage.next();
    }

    private async receiveMessage(message: Message): Promise<void> {
        if (!this.socketService.chatConnected) {
            this.snackBarService.openSnackBar("Le chat n'est pas connecté");
            return;
        }

        if (!message.room) message.room = 'Dessin';

        const messageToSend = {
            ...message,
            type: message._id === this.userService.user?._id ? MessageType.USER : MessageType.OTHER_USER,
            url: this.avatarService.userAvatarURL + message?.username,
        };
        this.pushMessage(messageToSend);
    }

    private userDisconnected(username: string): void {
        if (!this.socketService.chatConnected) {
            this.snackBarService.openSnackBar("Le chat n'est pas connecté");
            return;
        }

        const messageToSend = {
            timestamp: new Date(),
            message: `${username} déconnecté`,
            type: MessageType.SYSTEM,
            room: this.chatHandlerService.currentCanal?.name as string,
        } as Message;
        this.pushMessage(messageToSend);
    }

    private userConnected(username: string): void {
        const messageToSend = {
            timestamp: new Date(),
            message: `${username} connecté`,
            type: MessageType.SYSTEM,
            room: this.chatHandlerService.currentCanal?.name as string,
        } as Message;
        this.pushMessage(messageToSend);
    }

    clearNotifications(room: string): void {
        this.messagesRoom.set(room, {
            messages: this.messagesRoom.get(room)?.messages,
            notifications: 0,
        } as CanalMessages);
    }
}
