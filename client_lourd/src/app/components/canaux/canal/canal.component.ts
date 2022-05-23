import { Component, Input } from '@angular/core';
import { Canal, CanauxService } from '@app/services/canaux/canaux.service';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
    selector: 'app-canal',
    templateUrl: './canal.component.html',
    styleUrls: ['./canal.component.scss'],
})
export class CanalComponent {
    @Input() canal: Canal;
    constructor(public canauxService: CanauxService, public chatService: ChatService) {}
}
