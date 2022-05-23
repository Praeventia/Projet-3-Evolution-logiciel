import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { ConcoursService } from '@app/services/concours/concours.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-entries-page',
    templateUrl: './entries-page.component.html',
    styleUrls: ['./entries-page.component.scss'],
})
export class EntriesPageComponent implements OnInit, OnDestroy {
    constructor(
        public concoursService: ConcoursService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }

    interval: number;
    ngOnInit(): void {
        setTimeout(() => {
            this.concoursService.init(true);
        }, 0);
    }
    ngOnDestroy(): void {
        clearInterval(this.interval);
    }
}
