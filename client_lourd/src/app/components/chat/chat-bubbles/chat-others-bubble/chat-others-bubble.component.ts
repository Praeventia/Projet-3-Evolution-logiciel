import { Component, Input } from '@angular/core';
import { Message } from '@app/classes/message';
import { AvatarService } from '@app/services/avatar/avatar.service';

@Component({
    selector: 'app-chat-others-bubble',
    templateUrl: './chat-others-bubble.component.html',
    styleUrls: ['./chat-others-bubble.component.scss'],
})
export class ChatOthersBubbleComponent {
    @Input() message: Message;
    constructor(public avatarService: AvatarService) {}
}
