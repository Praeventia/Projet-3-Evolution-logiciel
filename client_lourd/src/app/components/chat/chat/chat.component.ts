import { ChangeDetectorRef, Component } from '@angular/core';
import { CanauxService } from '@app/services/canaux/canaux.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { ChatService } from '@app/services/chat/chat.service';
import { LoginService } from '@app/services/login/login.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    constructor(
        public canauxService: CanauxService,
        public chatHandler: ChatHandlerService,
        public chatService: ChatService,
        public socketService: SocketService,
        public loginService: LoginService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.chatHandler.notifyChatVisibilityChange().subscribe(() => {
            this.changeDetector.detectChanges();
        });

        this.canauxService.notifyWhenCanalUpdate().subscribe(() => {
            this.changeDetector.detectChanges();
        });

        this.canauxService.notifyIsInChat().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }
}
