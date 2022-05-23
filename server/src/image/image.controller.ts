import { Controller, Get, HttpException, HttpStatus, Param, Res, Request, UseGuards } from '@nestjs/common';
import { DRAWING_FOLDER, GIF_FOLDER } from 'src/const';
import { DrawingsService } from 'src/drawings/drawings.service';
import { SelectDrawingIDDto } from 'src/drawings/dto/select-drawing-drawingID.dto';
import { GifService } from 'src/gif/gif.service';
import * as fs from 'fs';
import { ImageGeneratorService } from 'src/image-generator/image-generator.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const generatePicturePath = (drawingID: string) => {
    const extension = '.png';
    const filepath = `${DRAWING_FOLDER}/${drawingID}${extension}`.toLowerCase();
    return filepath;
};

const generateGifPath = (drawingID: string) => {
    const extension = '.gif';
    const filepath = `${GIF_FOLDER}/${drawingID}${extension}`.toLowerCase();
    return filepath;
};

@UseGuards(JwtAuthGuard)
@Controller('image')
export class ImageController {
    constructor(private readonly drawingsService: DrawingsService, private readonly imageGeneratorService:ImageGeneratorService, private readonly gifService: GifService) {}

    @Get('drawing/:drawingID')
    async sendDrawingPicture(@Param() selectDrawingIDDto: SelectDrawingIDDto, @Res() res, @Request() req) {
        const drawing = await this.drawingsService.findDrawingByID(selectDrawingIDDto.drawingID);
        if(drawing == null) throw new HttpException('Le dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.drawingsService.userCanSeeDrawing(req.user._id, selectDrawingIDDto.drawingID);
        if(!result) throw new HttpException('Le dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const shouldUpdate = await this.drawingsService.pictureIsOutdated(selectDrawingIDDto.drawingID);
        if(shouldUpdate){
            const buffer = await this.imageGeneratorService.generateImage(selectDrawingIDDto.drawingID);
            if(buffer == null) throw new HttpException('Votre dessin n\'existe pas', HttpStatus.CONFLICT);
            const filePath = generatePicturePath(selectDrawingIDDto.drawingID);
            fs.writeFileSync(filePath, buffer);
            this.drawingsService.updateDrawingLastPictureUpdateTime(selectDrawingIDDto.drawingID);
            this.drawingsService.changeDrawingPicturePath(selectDrawingIDDto.drawingID, filePath);
            return res.sendFile(filePath, { root: './' }); 
        }
        return res.sendFile(drawing.drawingPath, { root: './' }); 
    }

    @Get('gif/:drawingID')
    async sendDrawingGif(@Param() selectDrawingIDDto: SelectDrawingIDDto, @Res() res, @Request() req) {
        const drawing = await this.drawingsService.findDrawingByID(selectDrawingIDDto.drawingID);
        if(drawing == null) throw new HttpException('Le dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const result = await this.drawingsService.userCanSeeDrawing(req.user._id, selectDrawingIDDto.drawingID);
        if(!result) throw new HttpException('Le dessin n\'existe pas', HttpStatus.NOT_ACCEPTABLE);
        const shouldUpdate = await this.drawingsService.gifIsOutdated(selectDrawingIDDto.drawingID);
        if(shouldUpdate){
            const buffer = await this.gifService.generateGif(selectDrawingIDDto.drawingID);
            if(buffer == null) throw new HttpException('Votre dessin n\'existe pas', HttpStatus.CONFLICT);
            const filePath = generateGifPath(selectDrawingIDDto.drawingID);
            fs.writeFileSync(filePath, buffer);
            this.drawingsService.updateDrawingLastGifUpdateTime(selectDrawingIDDto.drawingID);
            this.drawingsService.changeGifPicturePath(selectDrawingIDDto.drawingID, filePath);
            return res.sendFile(filePath, { root: './' }); 
        }
        return res.sendFile(drawing.gifPath, { root: './' }); 
    }
}

