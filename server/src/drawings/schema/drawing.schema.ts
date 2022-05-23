import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document, ObjectId } from 'mongoose';
import { Album } from 'src/albums/schema/album.schema';
import { Message } from 'src/rooms/schema/rooms.schema';
import { User } from 'src/users/schemas/users.schema';
import { CommandFromClientDto } from '../dto/real-time/command-from-client.dto';




export type DrawingDocument = Drawing & Document;
export type CommandDocument = Command & Document;


@Schema()
export class Drawing {
  @Prop({ required: true })
  drawingName: string;

  @Prop({ required: true })
  isPublic: boolean;

  @Prop({ required: true })
  isPasswordProtected: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Album' })
  album: Album;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ required: true })
  drawingPath: string;

  @Prop({ required: true })
  gifPath: string;

  @Prop()
  password: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  @Prop()
  isExposed: boolean;

  @Prop()
  creationDate: Date;

  @Prop()
  lastUpdate: Date;

  @Prop()
  lastImageUpdate: Date;

  @Prop()
  lastGifUpdate: Date;

  @Prop({required: true})
  numberOfCommand: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Command' }] })
  commands: Command[];

  _id?: ObjectId;
}

@Schema()
export class Command{
    @Prop({ required: true })
    timestamp: Date;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner: User;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Drawing' })
    drawing: Drawing;

    @Prop({required : true})
    commandNumber: number;

    @Prop({ required: true, type: CommandFromClientDto })
    command: CommandFromClientDto;

    _id?: ObjectId;
}




export const DrawingSchema = SchemaFactory.createForClass(Drawing);

export const CommandSchema = SchemaFactory.createForClass(Command);