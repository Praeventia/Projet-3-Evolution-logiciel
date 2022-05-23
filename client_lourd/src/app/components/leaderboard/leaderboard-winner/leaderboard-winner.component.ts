import { Component, Input } from '@angular/core';
import { LeaderboardWinner } from '@app/services/leaderboard/leaderboard.service';

@Component({
    selector: 'app-leaderboard-winner',
    templateUrl: './leaderboard-winner.component.html',
    styleUrls: ['./leaderboard-winner.component.scss'],
})
export class LeaderboardWinnerComponent {
    @Input() winner: LeaderboardWinner;
    @Input() position: number;
}
