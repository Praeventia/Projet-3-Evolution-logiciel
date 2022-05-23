import { ChangeDetectorRef, Component } from '@angular/core';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { LeaderboardService } from '@app/services/leaderboard/leaderboard.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-leaderboard-page',
    templateUrl: './leaderboard-page.component.html',
    styleUrls: ['./leaderboard-page.component.scss'],
})
export class LeaderboardPageComponent {
    constructor(
        public leaderboardService: LeaderboardService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
        setTimeout(() => {
            this.leaderboardService.init();
        }, 0);
    }
}
