import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';


@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) {}

    @Get('mostMessageSent')
    async mostMessageSent() {
        const result = await this.leaderboardService.mostMessageSent();
        return result;
    }

    @Get('mostTotalEditionTime')
    async mostTotalEditionTime() {
        const result = await this.leaderboardService.mostTotalEditionTime();
        return result;
    }

    @Get('mostPixelCross')
    async mostPixelCross() {
        const result = await this.leaderboardService.mostPixelCross();
        return result;
    }

    @Get('mostLineCount')
    async mostLineCount() {
        const result = await this.leaderboardService.mostLineCount();
        return result;
    }

    @Get('mostShapeCount')
    async mostShapeCount() {
        const result = await this.leaderboardService.mostShapeCount();
        return result;
    }

    @Get('mostRecentLogin')
    async mostRecentLogin() {
        const result = await this.leaderboardService.mostRecentLogin();
        return result;
    }

    @Get('mostOldLogin')
    async mostOldLogin() {
        const result = await this.leaderboardService.mostOldLogin();
        return result;
    }

    @Get('mostLogin')
    async mostLogin() {
        const result = await this.leaderboardService.mostLogin();
        return result;
    }

    @Get('mostDisconnect')
    async mostDisconnect() {
        const result = await this.leaderboardService.mostDisconnect();
        return result;
    }

    @Get('mostAverageCollaborationTime')
    async mostAverageCollaborationTime() {
        const result = await this.leaderboardService.mostAverageCollaborationTime();
        return result;
    }

    @Get('mostRoomJoin')
    async mostRoomJoin() {
        const result = await this.leaderboardService.mostRoomJoin();
        return result;
    }

    @Get('mostAlbumJoin')
    async mostAlbumJoin() {
        const result = await this.leaderboardService.mostAlbumJoin();
        return result;
    }

    @Get('mostDrawingContributed')
    async mostDrawingContributed() {
        const result = await this.leaderboardService.mostDrawingContributed();
        return result;
    }

    @Get('mostVote')
    async mostVote() {
        const result = await this.leaderboardService.mostVote();
        return result;
    }

    @Get('mostConcoursEntry')
    async mostConcoursEntry() {
        const result = await this.leaderboardService.mostConcoursEntry();
        return result;
    }
}
