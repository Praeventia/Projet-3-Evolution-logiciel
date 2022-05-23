import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConcoursService } from 'src/concours/concours.service';
import { User } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { MostAlbumJoinedDto } from './dto/most-album-joined.dto';
import { MostAverageCollaborationTime } from './dto/most-average-collaboration-time.dto';
import { MostConcoursEntryDto } from './dto/most-concours-entry.dto';
import { MostDisconnectTime } from './dto/most-disconnect-time.dto';
import { MostDrawingContributedDto } from './dto/most-drawing-contributed.dto';
import { MostLineCountDto } from './dto/most-line-count.dto';
import { MostLoginTime } from './dto/most-login-time.dto';
import { MostMessageSentDto } from './dto/most-message-sent.dto';
import { MostPixelCrossDto } from './dto/most-pixel-cross.dto';
import { MostRecentLogin } from './dto/most-recent-login.dto';
import { MostRoomJoinDto } from './dto/most-room-joined.dto';
import { MostShapeCountDto } from './dto/most-shape-count.dto';
import { MostTotalEditionTimeDto } from './dto/most-total-edition-time.dto';
import { MostVoteDto } from './dto/most-vote.dto';



@Injectable()
export class LeaderboardService {

    constructor(private readonly userService: UsersService, private readonly concoursService: ConcoursService) {}

    async mostMessageSent(): Promise<MostMessageSentDto[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['numberOfMessageSent', -1], ['_id', 1]]).limit(3);
            const answer: MostMessageSentDto[] = users.map((user: User): MostMessageSentDto =>{
                return { username : user.username, _id: user._id.toString(), numberOfMessageSent: user.numberOfMessageSent };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostTotalEditionTime(): Promise<MostTotalEditionTimeDto[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['totalEditionTime', -1], ['_id', 1]]).limit(3);
            const answer: MostTotalEditionTimeDto[] = users.map((user: User): MostTotalEditionTimeDto =>{
                return { username : user.username, _id: user._id.toString(), totalEditionTime:user.totalEditionTime };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostPixelCross(): Promise<MostPixelCrossDto[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['pixelCross', -1], ['_id', 1]]).limit(3);
            const answer: MostPixelCrossDto[] = users.map((user: User): MostPixelCrossDto =>{
                return { username : user.username, _id: user._id.toString(), pixelCross: user.pixelCross };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostLineCount(): Promise<MostLineCountDto[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['lineCount', -1], ['_id', 1]]).limit(3);
            const answer: MostLineCountDto[] = users.map((user: User): MostLineCountDto =>{
                return { username : user.username, _id: user._id.toString(), lineCount: user.lineCount };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostShapeCount(): Promise<MostShapeCountDto[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['shapeCount', -1], ['_id', 1]]).limit(3);
            const answer: MostShapeCountDto[] = users.map((user: User): MostShapeCountDto =>{
                return { username : user.username, _id: user._id.toString(), shapeCount: user.shapeCount };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostRecentLogin(): Promise<MostRecentLogin[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['lastLoginTime', -1], ['_id', 1]]).limit(3);
            const answer: MostRecentLogin[] = users.map((user: User): MostRecentLogin =>{
                return { username : user.username, _id: user._id.toString() };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostOldLogin(): Promise<MostRecentLogin[]>{
        try{
            const users: User[] = await this.userService.userModel.find().sort([['lastLoginTime', 1], ['_id', 1]]).limit(3);
            const answer: MostRecentLogin[] = users.map((user: User): MostRecentLogin =>{
                return { username : user.username, _id: user._id.toString() };
            });
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostLogin(): Promise<MostLoginTime[]>{
        try{
            const results = await this.userService.userModel.aggregate([
                {$unwind: '$allLoginDate'},
                {$group: {_id:'$_id', allLoginDate:{$push:'$allLoginDate'}, size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostLoginTime[] = await Promise.all(results.map(async (result): Promise<MostLoginTime> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), loginTime: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostDisconnect(): Promise<MostDisconnectTime[]>{
        try{
            const results = await this.userService.userModel.aggregate([
                {$unwind: '$allDisconnectDate'},
                {$group: {_id:'$_id', allDisconnectDate:{$push:'$allDisconnectDate'}, size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostDisconnectTime[] = await Promise.all(results.map(async (result): Promise<MostDisconnectTime> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), disconnectTime: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostAverageCollaborationTime(): Promise<MostAverageCollaborationTime[]>{
        try{
            const results = await this.userService.userModel.aggregate([
                {$unwind: '$timePerEdition'},
                {$group: {_id:'$_id', timePerEdition:{$avg:'$timePerEdition'}}},
                {$sort:{timePerEdition:-1, _id:1}}
            ]).limit(3);
            const answer: MostAverageCollaborationTime[] = await Promise.all(results.map(async (result): Promise<MostAverageCollaborationTime> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), averageTime: Math.floor(result.timePerEdition) };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostRoomJoin(): Promise<MostRoomJoinDto[]>{
        try{
            const results = await this.userService.userModel.aggregate([
                {$unwind: '$rooms'},
                {$group: {_id:'$_id', rooms:{$push:'$rooms'}, size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostRoomJoinDto[] = await Promise.all(results.map(async (result): Promise<MostRoomJoinDto> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), roomJoined: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostAlbumJoin(): Promise<MostAlbumJoinedDto[]>{
        try{
            const results = await this.userService.userModel.aggregate([
                {$unwind: '$albums'},
                {$group: {_id:'$_id', albums:{$push:'$albums'}, size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostAlbumJoinedDto[] = await Promise.all(results.map(async (result): Promise<MostAlbumJoinedDto> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), albumJoined: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostDrawingContributed(): Promise<MostDrawingContributedDto[]>{
        try{
            const results = await this.userService.userModel.aggregate([
                {$unwind: '$drawings'},
                {$group: {_id:'$_id', drawings:{$push:'$drawings'}, size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostDrawingContributedDto[] = await Promise.all(results.map(async (result): Promise<MostDrawingContributedDto> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), drawingContributed: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async mostVote(): Promise<MostVoteDto[]>{
        try{
            const results = await this.concoursService.concoursEntryModel.aggregate([
                {$unwind: '$userThatHasVoted'},
                {$group: {_id:'$userThatHasVoted', size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostVoteDto[] = await Promise.all(results.map(async (result): Promise<MostVoteDto> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), vote: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async mostConcoursEntry(): Promise<MostConcoursEntryDto[]>{
        try{
            const results = await this.concoursService.concoursEntryModel.aggregate([
                {$group: {_id:'$owner', size: {$sum:1}}},
                {$sort:{size:-1, _id:1}}
            ]).limit(3);
            const answer: MostConcoursEntryDto[] = await Promise.all(results.map(async (result): Promise<MostConcoursEntryDto> =>{
                const user = await this.userService.findOneByID(result._id.toString());
                return { username : user.username, _id: user._id.toString(), concoursEntry: result.size };
            }));
            return answer;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}
