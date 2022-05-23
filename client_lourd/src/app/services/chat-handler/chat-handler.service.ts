import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Canal } from '@app/services/canaux/canaux.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Observable, Subject } from 'rxjs';

// tslint:disable-next-line: no-any
let ipcRenderer: any;
// tslint:disable-next-line: no-any
const userAgent = navigator.userAgent.toLowerCase();
// tslint:disable-next-line
if (userAgent.indexOf(' electron/') > -1) ipcRenderer = (window as any).require('electron').ipcRenderer;

@Injectable({
    providedIn: 'root',
})
export class ChatHandlerService {
    currentCanal: Canal | undefined;
    canOpenExternalWindow: boolean = false;

    constructor(private socketService: SocketService, private router: Router) {
        this.socketService.notifyChatDisconnected().subscribe(() => {
            this.disconnect();
        });

        this.socketService.notifyChatConnected().subscribe(() => {
            this.canOpenExternalWindow = true;
            this.emitChatVisibilityChange();
        });
    }

    chatVisible: boolean = false;

    chatInExternalWindow: boolean = false;

    isInChat: boolean = false;

    chatVisibilityChange: Subject<void> = new Subject<void>();

    notifyChatVisibilityChange(): Observable<void> {
        return this.chatVisibilityChange.asObservable();
    }
    private emitChatVisibilityChange(): void {
        this.chatVisibilityChange.next();
    }

    toggleChat(): void {
        if (!this.socketService.chatConnected) {
            this.chatVisible = false;
            return;
        }
        this.chatVisible = !this.chatVisible;

        if (this.chatVisible) this.emitChatVisibilityChange();
    }

    async toggleChatExternalWindow(): Promise<void> {
        if (!this.canOpenExternalWindow) return;
        this.canOpenExternalWindow = false;
        this.router.url === '/chat' ? await this.closeChatExternalWindow() : await this.openChatExternalWindow();
    }

    private async openChatExternalWindow(): Promise<void> {
        this.chatInExternalWindow = true;
        await this.socketService.disconnectChat(true);

        ipcRenderer.send('open-chat-window');

        ipcRenderer.once('chat-window-closed', () => {
            this.chatInExternalWindow = false;
            this.canOpenExternalWindow = false;
            this.chatVisible = true;
            this.socketService.connectChat();
        });

        window.onbeforeunload = () => this.disconnect();
    }

    private async closeChatExternalWindow(): Promise<void> {
        await this.socketService.disconnectChat(true);
        ipcRenderer.send('close-chat-window');
    }

    disconnect(): void {
        this.canOpenExternalWindow = false;
        this.chatInExternalWindow = false;
        this.chatVisible = false;
    }
}
