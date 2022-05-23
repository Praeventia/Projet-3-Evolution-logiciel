import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { UsersModule } from 'src/users/users.module';
import { ConcoursModule } from 'src/concours/concours.module';

@Module({
    imports: [UsersModule, ConcoursModule],
    providers: [LeaderboardService],
    controllers: [LeaderboardController]
})
export class LeaderboardModule {}
