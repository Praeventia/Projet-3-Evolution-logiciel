import { SafeResourceUrl } from '@angular/platform-browser';

export enum MessageType {
    SYSTEM,
    OTHER_USER,
    USER,
}

export interface Message {
    _id: string;
    timestamp?: Date;
    username?: string;
    message: string;
    type?: MessageType;
    room: string;
    url: SafeResourceUrl;
    fromFetch: boolean;
}
