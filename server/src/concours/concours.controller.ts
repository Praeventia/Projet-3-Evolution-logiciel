import { Controller, Get, HttpException, HttpStatus, Put, UseGuards , Request, Param, Res, Query, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ConcoursService } from './concours.service';
import { ConcoursEntryToClient } from './dto/concours-entry-to-client.dto';
import { ConcoursEntry } from './schema/concours-entry.schema';
import { SelectConcoursEntryDto } from './dto/select-entry-dto';
import { SelectDrawingDto } from './dto/select-drawing.dto';

@UseGuards(JwtAuthGuard)
@Controller('concours')
export class ConcoursController {
    constructor(private readonly concoursService: ConcoursService) {}

    @Get('userCanStillPublishEntry')
    async userCanStillPublishEntry(@Request() req) {
        const result = await this.concoursService.userCanStillPublishEntry(req.user._id);
        return result;
    }

    @Put('uploadConcoursEntry')
    async uploadConcoursEntry(@Request() req, @Query() selectDrawingDto: SelectDrawingDto) {
        const newEntry: ConcoursEntryToClient = await this.concoursService.publishNewEntry(selectDrawingDto.drawingID, req.user._id);
        if(newEntry == null) throw new HttpException('Le dessin n\'a pas été publié', HttpStatus.NOT_ACCEPTABLE);
        return newEntry;
    }

    @Post('deleteConcoursEntry')
    async deleteConcoursEntry(@Body() selectConcoursEntryDto: SelectConcoursEntryDto, @Request() req) {
        const result = await this.concoursService.deleteEntry(selectConcoursEntryDto.id, req.user._id.toString());
        if(!result) throw new HttpException('Votre concours n\'a pas été supprimé', HttpStatus.CONFLICT);
    }

    @Get('picture/:id')
    async sendPicture(@Param() selectConcoursEntryDto: SelectConcoursEntryDto, @Res() res) {
        const concoursEntry: ConcoursEntry = await this.concoursService.getConcoursEntry(selectConcoursEntryDto.id);
        if(concoursEntry == null) throw new HttpException('Le concours n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return res.sendFile(concoursEntry.picturePath, { root: './' }); 
    }

    @Get('entryInfo/:id')
    async entryInfo(@Param() selectConcoursEntryDto: SelectConcoursEntryDto, @Request() req) {
        const result = await this.concoursService.getConcoursEntryInfoForClient(selectConcoursEntryDto.id, req.user._id);
        return result;
    }

    @Get('concoursWeekInfo/:id')
    async concoursWeekInfo(@Param() selectConcoursEntryDto: SelectConcoursEntryDto) {
        const result = await this.concoursService.getConcoursInfo(selectConcoursEntryDto.id);
        if(result == null) throw new HttpException('Le concours n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        return result;
    }

    @Get('allEntryCurrentConcours')
    async allEntryCurrentConcours(@Request() req) {
        const result = await this.concoursService.getAllEntryForCurrentConcours(req.user._id);
        return result;
    }

    @Get('allEntryByUser')
    async allEntryByUser(@Request() req) {
        const result = await this.concoursService.getAllEntryByUser(req.user._id);
        return result;
    }


    @Get('allPastEntryByUser')
    async allPastEntryByUser(@Request() req) {
        const result = await this.concoursService.getAllPastEntryByUser(req.user._id);
        return result;
    }

    @Get('currentEntryByUser')
    async currentEntryByUser(@Request() req) {
        const result = await this.concoursService.getCurrentConcoursEntryForClient(req.user._id);
        return result;
    }

    @Get('topEntryCurrentConcours')
    async topEntryCurrentConcours(@Request() req) {
        const result = await this.concoursService.getTopEntryForCurrentConcoursWeekClient(req.user._id);
        return result;
    }

    @Get('topEntryPastConcours')
    async topEntryPastConcours(@Request() req) {
        const result = await this.concoursService.getTopEntryForPastConcoursWeekClient(req.user._id);
        return result;
    }

    @Get('currentConcoursInfo')
    async currentConcoursInfo() {
        const result = await this.concoursService.getCurrentConcoursInfo();
        return result;
    }

    @Get('pastConcoursInfo')
    async pastConcoursInfo() {
        const result = await this.concoursService.getPastConcoursInfo();
        return result;
    }

    @Get('userCanStillUpVote')
    async userCanStillVote(@Request() req) {
        const result = await this.concoursService.userCanStillVote(req.user._id);
        return result;
    }

    @Get('numberOfUpVoteThisWeekByUser')
    async numberOfVoteThisWeek(@Request() req) {
        const result = await this.concoursService.countNumberOfVoteInCurrentConcoursWeek(req.user._id);
        return result;
    }

    @Post('upvoteForEntry')
    async voteForEntry(@Request() req, @Body() selectConcoursEntryDto: SelectConcoursEntryDto){
        const vote = await this.concoursService.addUpVoteForConcoursEntry(selectConcoursEntryDto.id, req.user._id);
        if(!vote) throw new HttpException('Votre vote n\'a pas été ajouté', HttpStatus.CONFLICT);
    }

    @Post('unupvoteForEntry')
    async unvoteForEntry(@Request() req, @Body() selectConcoursEntryDto: SelectConcoursEntryDto){
        const vote = await this.concoursService.removeUpVoteForConcoursEntry(selectConcoursEntryDto.id, req.user._id);
        if(!vote) throw new HttpException('Votre vote n\'a pas été retiré', HttpStatus.CONFLICT);
    }

    @Post('downvoteForEntry')
    async downvoteForEntry(@Request() req, @Body() selectConcoursEntryDto: SelectConcoursEntryDto){
        const vote = await this.concoursService.addDownVoteForConcoursEntry(selectConcoursEntryDto.id, req.user._id);
        if(!vote) throw new HttpException('Votre vote n\'a pas été ajouté', HttpStatus.CONFLICT);
    }

    @Post('undownvoteForEntry')
    async undownvoteForEntry(@Request() req, @Body() selectConcoursEntryDto: SelectConcoursEntryDto){
        const vote = await this.concoursService.removeDownVoteForConcoursEntry(selectConcoursEntryDto.id, req.user._id);
        if(!vote) throw new HttpException('Votre vote n\'a pas été retiré', HttpStatus.CONFLICT);
    }

}
