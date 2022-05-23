import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import * as mongoose from 'mongoose';


export type AlbumDocument = Album & Document;

@Schema()
export class Album {
  @Prop({ required: true })
  albumName: string;

  @Prop()
  description: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ required: true })
  creationDate: Date

  @Prop({ required: true })
  isPublic: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  usersRequestedToJoin: User[];

  _id?: ObjectId;
}


export const AlbumSchema = SchemaFactory.createForClass(Album);