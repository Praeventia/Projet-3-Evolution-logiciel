import { Component, Input } from '@angular/core';
import { Leaderboard, LeaderboardService } from '@app/services/leaderboard/leaderboard.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent {
    @Input() leaderboard: Leaderboard;
    constructor(public leaderboardService: LeaderboardService) {}
}
