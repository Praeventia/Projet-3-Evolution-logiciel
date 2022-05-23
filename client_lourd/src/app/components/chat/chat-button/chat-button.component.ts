import { Component } from '@angular/core';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-chat-button',
    templateUrl: './chat-button.component.html',
    styleUrls: ['./chat-button.component.scss'],
})
export class ChatButtonComponent {
    constructor(public chatHandlerService: ChatHandlerService, public socketService: SocketService) {}

    tryOpenChat(): void {
        this.chatHandlerService.toggleChat();
    }
}
