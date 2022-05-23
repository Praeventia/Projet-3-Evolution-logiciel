import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document, ObjectId } from 'mongoose';
import { ConcoursWeek } from './concours-week.schema';




export type ConcoursDocument = Concours & Document;

@Schema({ versionKey: false })
export class Concours {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'ConcoursWeek' })
  currentConcours: ConcoursWeek;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ConcoursWeek' }] })
  pastConcours: ConcoursWeek[];

  @Prop({ required: true})
  numberOfConcours: number;

  _id?: ObjectId;
}





export const ConcoursSchema = SchemaFactory.createForClass(Concours);

