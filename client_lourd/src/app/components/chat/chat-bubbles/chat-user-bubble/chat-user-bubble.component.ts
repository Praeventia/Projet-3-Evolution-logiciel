import { Component, Input } from '@angular/core';
import { Message } from '@app/classes/message';

@Component({
    selector: 'app-chat-user-bubble',
    templateUrl: './chat-user-bubble.component.html',
    styleUrls: ['./chat-user-bubble.component.scss'],
})
export class ChatUserBubbleComponent {
    @Input() message: Message;
}
