import { HttpService } from '@app/services/http/http.service';

export class Album {
    name: string;
    description: string;
    isPublic: boolean;

    constructor(name: string, description: string, isPublic: boolean) {
        httpService
        this.name = name;
        this.description = description;
        this.isPublic = isPublic;
    }

    get isOwner(): boolean {
        return this.isPublic;
    }
}