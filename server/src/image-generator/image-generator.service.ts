import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from 'src/const';
import { DrawingsService } from 'src/drawings/drawings.service';
import { DrawEllipseData } from 'src/drawings/dto/commands/data/draw-ellipse-data';
import { DrawPencilData } from 'src/drawings/dto/commands/data/draw-pencil-data';
import { DrawRectangleData } from 'src/drawings/dto/commands/data/draw-rectangle-data';
import { DrawEllipseCommand } from 'src/drawings/dto/commands/perfom-command/draw-ellipse-command';
import { DrawPencilCommand } from 'src/drawings/dto/commands/perfom-command/draw-pencil-command';
import { DrawRectangleCommand } from 'src/drawings/dto/commands/perfom-command/draw-rectangle-command';
import { PerformCommand } from 'src/drawings/dto/commands/perfom-command/performCommand';
import { ToolType } from 'src/drawings/dto/commands/tool-type';
import { CommandFromClientDto } from 'src/drawings/dto/real-time/command-from-client.dto';

@Injectable()
export class ImageGeneratorService {

    constructor(private readonly drawingsService: DrawingsService){ }

    async generateImage(drawingID: string): Promise<Buffer>{
        const drawing = await this.drawingsService.findDrawingByID(drawingID);
        if(drawing == null) throw new HttpException('Le dessin n\'existe pas', HttpStatus.CONFLICT);
        const commandsToClient= await this.drawingsService.getAllCommandsInDrawing(drawingID);
        const commandsToPerform: PerformCommand [] = [];
        for(const commandToClient of commandsToClient){
            const commandToPerform = this.generateCommandToPerform(commandToClient.command);
            if(commandToPerform != null) commandsToPerform.push(commandToPerform);
        }
        const canvas= createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);
        const ctx = canvas.getContext('2d');
        this.whiteBackground(ctx);
        for(const commandToPerform of commandsToPerform){
            await commandToPerform.do(ctx);
        }
        return canvas.toBuffer();
    }

    generateCommandToPerform(commandFromClient: CommandFromClientDto): PerformCommand{
        switch (commandFromClient.tool){
        case ToolType.pencil:{
            const pencilCommand = new DrawPencilCommand(commandFromClient.commandData as DrawPencilData);
            return pencilCommand;
        }
        case ToolType.rectangle:{
            const rectCommand = new DrawRectangleCommand(commandFromClient.commandData as DrawRectangleData);
            return rectCommand;
        }
        case ToolType.ellipse:{
            const ellipseCommand = new DrawEllipseCommand(commandFromClient.commandData as DrawEllipseData);
            return ellipseCommand;
        }   
        default:
            return undefined;        
        }
    }

    whiteBackground(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);
    }
}
