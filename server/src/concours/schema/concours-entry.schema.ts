import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document, ObjectId } from 'mongoose';
import { Drawing } from 'src/drawings/schema/drawing.schema';
import { User } from 'src/users/schemas/users.schema';
import { ConcoursWeek } from './concours-week.schema';




export type ConcoursEntryDocument = ConcoursEntry & Document;


@Schema({ versionKey: false })
export class ConcoursEntry {

  @Prop({ required: true })
  drawingName: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Drawing' })
  drawing: Drawing;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  userThatHasVoted: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  userThatHasDownVoted: User[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'ConcoursWeek' })
  concoursWeek: ConcoursWeek;

  @Prop({ required: true })
  picturePath: string;

  @Prop({ required: true })
  creationDate: Date;

  @Prop({ required: true })
  vote: number;
  
  _id?: ObjectId;
}





export const ConcoursEntrySchema = SchemaFactory.createForClass(ConcoursEntry);

