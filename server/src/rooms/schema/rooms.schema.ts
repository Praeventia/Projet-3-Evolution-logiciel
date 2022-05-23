import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';

export type RoomDocument = Room & Document;
export type MessageDocument = Message & Document;


@Schema()
export class Message{
    @Prop()
    timestamp: Date;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
    
    @Prop()
    message: string;

    _id?;
}


@Schema({ versionKey: false })
export class Room {
  @Prop({ required: true })
  roomName: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  _id?;
}


export const RoomSchema = SchemaFactory.createForClass(Room);

export const MessageSchema = SchemaFactory.createForClass(Message);