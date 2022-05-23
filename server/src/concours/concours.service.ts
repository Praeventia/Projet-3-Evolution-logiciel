import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { Model } from 'mongoose';
import { ConcoursEntry, ConcoursEntryDocument } from './schema/concours-entry.schema';
import { ConcoursWeek, ConcoursWeekDocument } from './schema/concours-week.schema';
import { Concours, ConcoursDocument } from './schema/concours.schema';
import {CONCOURS_FOLDER, CONCOURS_THEME, CONCOURS_TIME, CONCOURS_TIME_UPDATE, DEFAULT_CONCOURS_PICTURE, MAX_CONCOURS_POST_PER_WEEK, MAX_VOTE_PER_WEEK} from 'src/const';
import * as parser from 'cron-parser';
import { Cron } from '@nestjs/schedule';
import { PastWinnerConcours } from './dto/past-winner-concours.dto';
import { DrawingsService } from 'src/drawings/drawings.service';
import { ConcoursEntryToClient } from './dto/concours-entry-to-client.dto';
import * as fs from 'fs';
import { ImageGeneratorService } from 'src/image-generator/image-generator.service';

const generateConcoursPath = (concoursID: string) => {
    const extension = '.png';
    const filepath = `${CONCOURS_FOLDER}/${concoursID}${extension}`.toLowerCase();
    return filepath;
};

@Injectable()
export class ConcoursService {
    constructor(
        @InjectModel(Concours.name) public concoursModel: Model <ConcoursDocument>,
        @InjectModel(ConcoursWeek.name) public concoursWeekModel: Model <ConcoursWeekDocument>,
        @InjectModel(ConcoursEntry.name) public concoursEntryModel: Model <ConcoursEntryDocument>,
        private readonly userService: UsersService,
        private readonly drawingsService: DrawingsService,
        private imageGenoratorService: ImageGeneratorService
    )
    {
        this.initConcours();
    }

    generateNewConcours(themeIndex:number): ConcoursWeek {
        const interval = parser.parseExpression(CONCOURS_TIME);
        const start:Date = interval.prev().toDate();
        const end:Date = interval.next().toDate();
        //allow round robin on concours
        const index = themeIndex % CONCOURS_THEME.length;
        const weekConcours: ConcoursWeek={
            theme: CONCOURS_THEME[index],
            startDate: start,
            endDate: end
        };
        return weekConcours;
    }

    async getConcoursInstance(): Promise<Concours>{
        try{
            const concours: Concours[]=await this.concoursModel.find();
            return concours[0];

        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async initConcours(): Promise<void>{
        try{
            const concours: Concours = await this.getConcoursInstance();
            if(concours == null){
                const weekConcoursDatabase: ConcoursWeek = await this.concoursWeekModel.create(this.generateNewConcours(0));
                const concours: Concours={
                    currentConcours: weekConcoursDatabase,
                    pastConcours: [],
                    numberOfConcours:1
                };
                await this.concoursModel.create(concours);
            }
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    @Cron(CONCOURS_TIME_UPDATE)
    async weeklyConcoursUpdate(): Promise<void>{
        try{
            const concours: Concours = await this.getConcoursInstance();
            if(concours == null){
                this.initConcours();
                return;
            }
            const currentWeekConcours: ConcoursWeek = concours.currentConcours;
            const newWeekConcoursDatabase: ConcoursWeek = await this.concoursWeekModel.create(this.generateNewConcours(concours.numberOfConcours));
            await this.concoursModel.updateOne({_id:concours._id},
                {
                    $addToSet: {
                        pastConcours:currentWeekConcours
                    },
                    currentConcours:newWeekConcoursDatabase,
                    $inc: {numberOfConcours: 1}
                }
            );

        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getConcoursEntry(concoursEntryID:string): Promise<ConcoursEntry>{
        try{
            const concoursEntry = await this.concoursEntryModel.findById(concoursEntryID);
            return concoursEntry; 
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getConcoursEntryInfoForClient(concoursEntryID:string, userID: string): Promise<ConcoursEntryToClient>{
        try{
            const concoursEntry = await this.getConcoursEntry(concoursEntryID);
            const user = await this.userService.findOneByID(userID);
            if(concoursEntry == null || user ==null) return null;
            const concoursEntryToReturn: ConcoursEntryToClient = {
                drawingName: concoursEntry.drawingName,
                ownerID: concoursEntry.owner._id.toString(),
                hasAlreadyUpVoted: await this.checkIfUserHasAlreadyUpVoted(concoursEntryID, userID),
                hasAlreadyDownVoted: await this.checkIfUserHasAlreadyDownVoted(concoursEntryID, userID),
                concoursWeekID: concoursEntry.concoursWeek._id.toString(),
                creationDate: concoursEntry.creationDate,
                vote: concoursEntry.vote,
                _id: concoursEntry._id.toString()
            };
            return concoursEntryToReturn; 
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCurrentConcoursEntryForClient(userID: string): Promise<ConcoursEntryToClient>{
        try{
            const concours: Concours = await this.getConcoursInstance();
            const concoursEntry = await this.concoursEntryModel.findOne({owner:userID, concoursWeek: concours.currentConcours._id.toString()});
            const user = await this.userService.findOneByID(userID);
            if(concoursEntry == null || user ==null) return null;
            const concoursEntryToReturn: ConcoursEntryToClient = {
                drawingName: concoursEntry.drawingName,
                ownerID: concoursEntry.owner._id.toString(),
                hasAlreadyUpVoted: await this.checkIfUserHasAlreadyUpVoted(concoursEntry._id.toString(), userID),
                hasAlreadyDownVoted: await this.checkIfUserHasAlreadyDownVoted(concoursEntry._id.toString(), userID),
                concoursWeekID: concoursEntry.concoursWeek._id.toString(),
                creationDate: concoursEntry.creationDate,
                vote: concoursEntry.vote,
                _id: concoursEntry._id.toString()
            };
            return concoursEntryToReturn; 
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllEntryByUser(userID: string): Promise<ConcoursEntryToClient[]>{
        try{
            const user = await this.userService.findOneByID(userID);
            if(user == null) return null;
            const concoursEntry: ConcoursEntry[] = await this.concoursEntryModel.find({owner:userID});
            if(concoursEntry == null) return null;
            const result = Promise.all(await concoursEntry.map(async (concoursEntry: ConcoursEntry): Promise<ConcoursEntryToClient>=>{
                const concoursEntryToReturn: ConcoursEntryToClient = {
                    drawingName: concoursEntry.drawingName,
                    ownerID: concoursEntry.owner._id.toString(),
                    hasAlreadyUpVoted: await this.checkIfUserHasAlreadyUpVoted(concoursEntry._id.toString(), userID),
                    hasAlreadyDownVoted: await this.checkIfUserHasAlreadyDownVoted(concoursEntry._id.toString(), userID),
                    concoursWeekID: concoursEntry.concoursWeek._id.toString(),
                    creationDate: concoursEntry.creationDate,
                    vote: concoursEntry.vote,
                    _id: concoursEntry._id.toString()
                };
                return concoursEntryToReturn; 

            }));
            return result;
            
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllPastEntryByUser(userID: string): Promise<ConcoursEntryToClient[]>{
        try{
            const user = await this.userService.findOneByID(userID);
            if(user == null) return null;
            const concours: Concours = await this.getConcoursInstance();
            const concoursEntry: ConcoursEntry[] = await this.concoursEntryModel.find({owner:userID, concoursWeek:{$ne:concours.currentConcours._id.toString()}});
            if(concoursEntry == null) return null;
            const result = Promise.all(await concoursEntry.map(async (concoursEntry: ConcoursEntry): Promise<ConcoursEntryToClient>=>{
                const concoursEntryToReturn: ConcoursEntryToClient = {
                    drawingName: concoursEntry.drawingName,
                    ownerID: concoursEntry.owner._id.toString(),
                    hasAlreadyUpVoted: await this.checkIfUserHasAlreadyUpVoted(concoursEntry._id.toString(), userID),
                    hasAlreadyDownVoted: await this.checkIfUserHasAlreadyDownVoted(concoursEntry._id.toString(), userID),
                    concoursWeekID: concoursEntry.concoursWeek._id.toString(),
                    creationDate: concoursEntry.creationDate,
                    vote: concoursEntry.vote,
                    _id: concoursEntry._id.toString()
                };
                return concoursEntryToReturn; 

            }));
            return result;
            
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    async getAllEntryForCurrentConcours(userID: string):Promise<ConcoursEntryToClient[]>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return [];
        try{
            const concours: Concours = await this.getConcoursInstance();

            const allConcoursEntry: ConcoursEntry[] = await this.concoursEntryModel.find({concoursWeek:concours.currentConcours._id}).sort({creationDate:1});
            if(allConcoursEntry == null) return [];
            const result: ConcoursEntryToClient[] = await Promise.all(allConcoursEntry.map(async (concoursEntry: ConcoursEntry): Promise<ConcoursEntryToClient> => {
                const concoursEntryToReturn: ConcoursEntryToClient = {
                    drawingName: concoursEntry.drawingName,
                    ownerID: concoursEntry.owner._id.toString(),
                    hasAlreadyUpVoted: await this.checkIfUserHasAlreadyUpVoted(concoursEntry._id.toString(), userID),
                    hasAlreadyDownVoted: await this.checkIfUserHasAlreadyDownVoted(concoursEntry._id.toString(), userID),
                    concoursWeekID: concoursEntry.concoursWeek._id.toString(),
                    creationDate: concoursEntry.creationDate,
                    vote: concoursEntry.vote,
                    _id: concoursEntry._id.toString()
                };
                return concoursEntryToReturn; 

            }));
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getConcoursInfo(concoursWeekID: string): Promise<ConcoursWeek>{
        try{
            const currentWeek = await this.concoursWeekModel.findById(concoursWeekID);
            return currentWeek;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async getCurrentConcoursInfo(): Promise<ConcoursWeek>{
        try{
            const concours = await this.getConcoursInstance();
            const currentWeek = await this.concoursWeekModel.findById(concours.currentConcours._id);
            return currentWeek;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPastConcoursInfo(): Promise<ConcoursWeek[]>{
        try{
            const concours = await this.getConcoursInstance();
            const concoursPopulate = await this.concoursModel.findById(concours._id).populate(
                { 
                    path: 'pastConcours',
                    options:{ sort: { 'startDate': 1 } },
                }
            ).exec();
            return concoursPopulate.pastConcours;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTopEntryForConcoursWeek(concoursWeekID:string, userID: string): Promise<ConcoursEntryToClient[]>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return [];
        try{
            const concoursEntry:ConcoursEntry[] = await this.concoursEntryModel.find({concoursWeek: concoursWeekID}).sort([['vote', -1], ['creationDate', 1]]).limit(3);
            const result: ConcoursEntryToClient[] = await Promise.all(concoursEntry.map(async (concoursEntry: ConcoursEntry): Promise<ConcoursEntryToClient> => {
                const concoursEntryToReturn: ConcoursEntryToClient = {
                    drawingName: concoursEntry.drawingName,
                    ownerID: concoursEntry.owner._id.toString(),
                    hasAlreadyUpVoted: await this.checkIfUserHasAlreadyUpVoted(concoursEntry._id.toString(), userID),
                    hasAlreadyDownVoted: await this.checkIfUserHasAlreadyDownVoted(concoursEntry._id.toString(), userID),
                    concoursWeekID: concoursEntry.concoursWeek._id.toString(),
                    creationDate: concoursEntry.creationDate,
                    vote: concoursEntry.vote,
                    _id: concoursEntry._id.toString()
                };
                return concoursEntryToReturn; 
            }));
            return result;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTopEntryForCurrentConcoursWeekClient(userID: string): Promise<PastWinnerConcours>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return null;
        try{
            const concours = await this.getConcoursInstance();
            const currentConcoursWeek: ConcoursWeek = await this.getCurrentConcoursInfo();
            const winner: PastWinnerConcours = {
                concoursWeek: currentConcoursWeek,
                winner: await this.getTopEntryForConcoursWeek(concours.currentConcours._id.toString(), userID)
            };
            return winner;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTopEntryForPastConcoursWeekClient(userID :string): Promise<PastWinnerConcours[]>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return [];
        const pastConcours: ConcoursWeek[] = await this.getPastConcoursInfo();
        const result: PastWinnerConcours[] = [];
        for(const concoursWeek of pastConcours){
            const pastWinner: PastWinnerConcours = {
                concoursWeek: concoursWeek,
                winner: await this.getTopEntryForConcoursWeek(concoursWeek._id.toString(), userID)
            };
            result.push(pastWinner);
        }
        return result;
    }

    async checkIfUserHasAlreadyUpVoted(concoursEntryID: string, userID:string): Promise<boolean>{
        const concoursEntry = await this.getConcoursEntry(concoursEntryID);
        const user = await this.userService.findOneByID(userID);
        if(concoursEntry == null || user == null) return false;
        try{
            const doesUserHasAlreadyVoted: ConcoursEntry = await this.concoursEntryModel.findOne({_id:concoursEntryID, userThatHasVoted: userID});
            if(doesUserHasAlreadyVoted == null) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async checkIfUserHasAlreadyDownVoted(concoursEntryID: string, userID:string): Promise<boolean>{
        const concoursEntry = await this.getConcoursEntry(concoursEntryID);
        const user = await this.userService.findOneByID(userID);
        if(concoursEntry == null || user == null) return false;
        try{
            const doesUserHasAlreadyVoted: ConcoursEntry = await this.concoursEntryModel.findOne({_id:concoursEntryID, userThatHasDownVoted: userID});
            if(doesUserHasAlreadyVoted == null) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async countNumberOfVoteInCurrentConcoursWeek(userID:string) : Promise<number>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return 0;
        const concours: Concours = await this.getConcoursInstance();
        try{
            const result1: ConcoursEntry[] = await this.concoursEntryModel.find(
                {
                    concoursWeek: concours.currentConcours._id.toString(), 
                    userThatHasVoted: userID 
                
                }  
            );
            const result2: ConcoursEntry[] = await this.concoursEntryModel.find(
                {
                    concoursWeek: concours.currentConcours._id.toString(), 
                    userThatHasDownVoted: userID 
                
                }  
            );
            return result1.length + result2.length;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async userCanStillVote(userID: string): Promise<boolean>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return false;
        const numberOfVoteThisWeek = await this.countNumberOfVoteInCurrentConcoursWeek(userID);
        if(numberOfVoteThisWeek < MAX_VOTE_PER_WEEK) return true;
        return false;
    }

    async addUpVoteForConcoursEntry(concoursEntryID:string, userID: string): Promise<boolean>{
        const concoursEntry: ConcoursEntry = await this.getConcoursEntry(concoursEntryID);
        const user = await this.userService.findOneByID(userID);
        if(concoursEntry == null || user == null) throw new HttpException('Ce dessin ne fait pas partie du concours', HttpStatus.CONFLICT);
        if(concoursEntry.owner._id.toString() === user._id.toString()) throw new HttpException('Vous ne pouvez pas voter', HttpStatus.CONFLICT); 
        const hasVoted: boolean = await this.checkIfUserHasAlreadyUpVoted(concoursEntryID, userID);
        if(hasVoted) throw new HttpException('Vous avez déjà voter pour ce dessin', HttpStatus.CONFLICT);
        const userCanVote = await this.userCanStillVote(userID);
        if(!userCanVote) throw new HttpException(`Vous avez déjà voté ${MAX_VOTE_PER_WEEK}`, HttpStatus.CONFLICT);
        const concours: Concours = await this.getConcoursInstance();
        if(concours.currentConcours._id.toString() !== concoursEntry.concoursWeek._id.toString()) throw new HttpException('Ce dessin ne fait pas partie du concours actuel', HttpStatus.CONFLICT);
        try{
            const hasDownVoted: boolean = await this.checkIfUserHasAlreadyDownVoted(concoursEntryID, userID);
            //je retire son downvote
            if(hasDownVoted) await this.removeDownVoteForConcoursEntry(concoursEntryID, userID);
            const result = await this.concoursEntryModel.updateOne({_id: concoursEntryID},
                {
                    $inc: {vote: 1},
                    $addToSet: {
                        userThatHasVoted:user
                    }
                }
            );
            if(result.modifiedCount<1) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeUpVoteForConcoursEntry(concoursEntryID:string, userID: string): Promise<boolean>{
        const concoursEntry = await this.getConcoursEntry(concoursEntryID);
        const user = await this.userService.findOneByID(userID);
        if(concoursEntry == null || user == null) throw new HttpException('Ce dessin ne fait pas partie du concours', HttpStatus.CONFLICT);
        if(concoursEntry.owner._id.toString() === user._id.toString()) throw new HttpException('Vous ne pouvez pas dévoter', HttpStatus.CONFLICT);
        const hasVoted: boolean = await this.checkIfUserHasAlreadyUpVoted(concoursEntryID, userID);
        if(!hasVoted) throw new HttpException('Vous n\'avez pas voter pour ce dessin', HttpStatus.CONFLICT);
        const concours: Concours = await this.getConcoursInstance();
        if(concours.currentConcours._id.toString() !== concoursEntry.concoursWeek._id.toString()) throw new HttpException('Ce dessin ne fait pas partie du concours actuel', HttpStatus.CONFLICT);
        try{
            const result = await this.concoursEntryModel.updateOne({_id: concoursEntryID},
                {
                    $inc: {vote: -1},
                    $pull: {
                        userThatHasVoted:user._id
                    }
                }
            );
            if(result.modifiedCount<1) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addDownVoteForConcoursEntry(concoursEntryID:string, userID: string): Promise<boolean>{
        const concoursEntry: ConcoursEntry = await this.getConcoursEntry(concoursEntryID);
        const user = await this.userService.findOneByID(userID);
        if(concoursEntry == null || user == null) throw new HttpException('Ce dessin ne fait pas partie du concours', HttpStatus.CONFLICT);
        if(concoursEntry.owner._id.toString() === user._id.toString()) throw new HttpException('Vous ne pouvez pas voter', HttpStatus.CONFLICT); 
        const hasVoted: boolean = await this.checkIfUserHasAlreadyDownVoted(concoursEntryID, userID);
        if(hasVoted) throw new HttpException('Vous avez déjà down voter pour ce dessin', HttpStatus.CONFLICT);
        const concours: Concours = await this.getConcoursInstance();
        if(concours.currentConcours._id.toString() !== concoursEntry.concoursWeek._id.toString()) throw new HttpException('Ce dessin ne fait pas partie du concours actuel', HttpStatus.CONFLICT);
        try{
            const hasUpVoted = await this.checkIfUserHasAlreadyUpVoted(concoursEntryID, userID);
            if(hasUpVoted) await this.removeUpVoteForConcoursEntry(concoursEntryID, userID);
            const result = await this.concoursEntryModel.updateOne({_id: concoursEntryID},
                {
                    $inc: {vote: -1},
                    $addToSet: {
                        userThatHasDownVoted:user
                    }
                }
            );
            if(result.modifiedCount<1) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeDownVoteForConcoursEntry(concoursEntryID:string, userID: string): Promise<boolean>{
        const concoursEntry = await this.getConcoursEntry(concoursEntryID);
        const user = await this.userService.findOneByID(userID);
        if(concoursEntry == null || user == null) throw new HttpException('Ce dessin ne fait pas partie du concours', HttpStatus.CONFLICT);
        if(concoursEntry.owner._id.toString() === user._id.toString()) throw new HttpException('Vous ne pouvez pas dévoter', HttpStatus.CONFLICT);
        const hasVoted: boolean = await this.checkIfUserHasAlreadyDownVoted(concoursEntryID, userID);
        if(!hasVoted) throw new HttpException('Vous n\'avez pas down voter pour ce dessin', HttpStatus.CONFLICT);
        const concours: Concours = await this.getConcoursInstance();
        if(concours.currentConcours._id.toString() !== concoursEntry.concoursWeek._id.toString()) throw new HttpException('Ce dessin ne fait pas partie du concours actuel', HttpStatus.CONFLICT);
        try{
            const result = await this.concoursEntryModel.updateOne({_id: concoursEntryID},
                {
                    $inc: {vote: 1},
                    $pull: {
                        userThatHasDownVoted:user._id
                    }
                }
            );
            if(result.modifiedCount<1) return false;
            return true;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async countNumberOfEntryInCurrentConcoursWeek(userID:string) : Promise<number>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return 0;
        const concours: Concours = await this.getConcoursInstance();
        try{
            const result: ConcoursEntry[] = await this.concoursEntryModel.find(
                {
                    concoursWeek: concours.currentConcours._id.toString(), 
                    owner: userID 
                
                }  
            );
            return result.length;
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async userCanStillPublishEntry(userID: string): Promise<boolean>{
        const user = await this.userService.findOneByID(userID);
        if(user == null) return false;
        const numberOfEntryThisWeek = await this.countNumberOfEntryInCurrentConcoursWeek(userID);
        if(numberOfEntryThisWeek < MAX_CONCOURS_POST_PER_WEEK) return true;
        return false;
    }

    async publishNewEntry(drawingID: string, userID: string): Promise<ConcoursEntryToClient>{
        const drawing = await this.drawingsService.findDrawingByID(drawingID);
        const user = await this.userService.findOneByID(userID);
        if(drawing == null || user == null) return null;
        const access = await this.drawingsService.userHasAccessToDrawing(userID, drawingID);
        if(!access) return null;
        const canPublish = await this.userCanStillPublishEntry(userID);
        if(!canPublish) return null;
        const concours: Concours = await this.getConcoursInstance();
        try{
            const concoursWeek: ConcoursWeek = await this.concoursWeekModel.findById(concours.currentConcours._id);
            const newEntry:ConcoursEntry = {
                drawingName: drawing.drawingName,
                owner: user,
                drawing: drawing,
                concoursWeek: concoursWeek,
                picturePath: DEFAULT_CONCOURS_PICTURE,
                creationDate: new Date(),
                vote: 1,
                userThatHasVoted:[user],
                userThatHasDownVoted:[]
            };
            const newEntryCreated: ConcoursEntry = await this.concoursEntryModel.create(newEntry);
            const buffer = await this.imageGenoratorService.generateImage(drawingID);
            const filePath = generateConcoursPath(newEntryCreated._id.toString());
            fs.writeFileSync(filePath, buffer);
            await this.changePicturePath(newEntryCreated._id.toString(), filePath);
            const entryToClient = await this.getConcoursEntryInfoForClient(newEntryCreated._id.toString(), userID);
            return entryToClient; 
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changePicturePath(concoursEntryID: string, newPicturePath: string): Promise<void>{
        try{
            await this.concoursEntryModel.updateOne({_id: concoursEntryID},
                {picturePath: newPicturePath}
            );
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteEntry(concoursEntryID: string, userID: string): Promise<boolean>{
        try{
            const result = await this.concoursEntryModel.deleteOne({_id:concoursEntryID, owner: userID});
            if(result.deletedCount<1) return false;
            return true; 
        }catch(error:any){
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
