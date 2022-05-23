import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import * as GIFEncoder from 'gif-encoder-2';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH} from 'src/const';
import { createCanvas} from 'canvas';


const shouldAddFrame = (index, step, numberOfCommand): boolean =>{
    if(index === (numberOfCommand-1)) return true;
    if((index%step) === 0) return true;
    return false; 
};

@Injectable()
export class GifService {
    constructor(private readonly drawingsService: DrawingsService){ }

    async generateGif(drawingID: string): Promise<Buffer>{
        //prepare commands
        const drawing = await this.drawingsService.findDrawingByID(drawingID);
        if(drawing == null) throw new HttpException('Le dessin n\'existe pas', HttpStatus.CONFLICT);
        const commandsInDrawing= await this.drawingsService.getAllCommandsInDrawing(drawingID);
        const commandsToPerform: PerformCommand [] = [];
        for(const commandInDrawing of commandsInDrawing){
            const commandToPerform = this.generateCommandToPerform(commandInDrawing.command);
            if(commandToPerform != null) commandsToPerform.push(commandToPerform);
        }
        //prepare canvas
        const canvas= createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);
        const ctx = canvas.getContext('2d');
        this.whiteBackground(ctx);

        //prepare encoder
        const encoder = new GIFEncoder(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'neuquant', false);
        encoder.setDelay(200);
        encoder.start();
        encoder.addFrame(ctx);
        //max 40 step
        const step = Math.ceil(commandsToPerform.length / 40);
        //perform
        for(let i = 0; i < commandsToPerform.length; i++){
            commandsToPerform[i].do(ctx);
            if(shouldAddFrame(i, step, commandsToPerform.length)){
                encoder.addFrame(ctx);
            }
        }
        encoder.finish();
        const buffer = encoder.out.getData();
        return buffer;
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
