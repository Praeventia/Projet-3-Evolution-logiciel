import { ChangeDetectorRef, Component } from '@angular/core';
import { AlbumService } from '@app/services/album/album.service';
import { CanauxService } from '@app/services/canaux/canaux.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { ChatService } from '@app/services/chat/chat.service';
import { ConcoursService } from '@app/services/concours/concours.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'ColorImage';
    constructor(
        public chatService: ChatService,
        public canauxService: CanauxService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
        public userService: UserService,
        private changeDetector: ChangeDetectorRef,
        private albumService: AlbumService,
        private drawingsService: DrawingsService,
        private concoursService: ConcoursService,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
        this.albumService.init(false);
        this.drawingsService.init(false);
        this.concoursService.init(false);
    }
}
