import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';





export type ConcoursWeekDocument = ConcoursWeek & Document;


@Schema({ versionKey: false })
export class ConcoursWeek {

  @Prop({ required: true })
  theme: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  _id?: ObjectId;
}





export const ConcoursWeekSchema = SchemaFactory.createForClass(ConcoursWeek);

