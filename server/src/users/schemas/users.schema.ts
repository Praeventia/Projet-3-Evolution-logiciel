import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Room } from 'src/rooms/schema/rooms.schema';
import { ObjectId } from 'mongoose';
import { Drawing } from 'src/drawings/schema/drawing.schema';
import { Album } from 'src/albums/schema/album.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  lastLoginTime: number;

  @Prop({ required: true })
  allLoginDate: Date[];

  @Prop({ required: true })
  allDisconnectDate: Date[];

  @Prop({ required: true })
  totalEditionTime: number;

  @Prop({ required: true })
  numberOfMessageSent: number;

  @Prop({ required: true })
  pixelCross: number;

  @Prop({ required: true })
  lineCount: number;

  @Prop({ required: true })
  isEmailProtected: boolean;

  @Prop({ required: true })
  shapeCount: number;

  @Prop({ required: true })
  timePerEdition: number[];
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }] })
  rooms: Room[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Drawing' }] })
  drawings: Drawing[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }] })
  albums: Album[];

  @Prop({ required: true })
  avatarPath: string;

  _id?: ObjectId;
}

export interface UserClientSide{
  username:string,
  email: string,
  _id: string,
  isEmailProtected: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);