import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { Message, MessageType } from '@app/classes/message';
import { CanauxService } from '@app/services/canaux/canaux.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { ChatService } from '@app/services/chat/chat.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { UserService } from '@app/services/user/user.service';

// tslint:disable-next-line:only-arrow-functions
export function isSystemMessage(message: Message): boolean {
    return message.type === MessageType.SYSTEM;
}
// tslint:disable-next-line:only-arrow-functions
export function isUserMessage(message: Message): boolean {
    return message.type === MessageType.USER;
}
// tslint:disable-next-line:only-arrow-functions
export function isOtherUserMessage(message: Message): boolean {
    return message.type === MessageType.OTHER_USER;
}
@Component({
    selector: 'app-chat-display',
    templateUrl: './chat-display.component.html',
    styleUrls: ['./chat-display.component.scss'],
})
export class ChatRoomComponent implements AfterViewInit {
    private readonly DEFAULT_MESSAGE: string = '';

    messageInput: string = '';

    @ViewChild('bubbles') private bubbles: ElementRef;
    @ViewChild('input') private input: ElementRef;

    constructor(
        private keyEventService: KeyEventService,
        public chatService: ChatService,
        public userService: UserService,
        private canauxService: CanauxService,
        public chatHandler: ChatHandlerService,
        private changeDetection: ChangeDetectorRef,
    ) {
        this.chatService.notifyWhenNewMessages().subscribe(() => {
            this.changeDetection.detectChanges();
            setTimeout(() => {
                this.changeDetection.detectChanges();
                this.scrollToBottom();
            });
        });

        this.keyEventService.getKeyDownEvent('Enter').subscribe(() => {
            this.sendMessage();
        });
    }

    isSystemMessage(message: Message): boolean {
        return isSystemMessage(message);
    }
    isUserMessage(message: Message): boolean {
        return isUserMessage(message);
    }
    isOtherUserMessage(message: Message): boolean {
        return isOtherUserMessage(message);
    }

    sendMessage(): void {
        if (this.sendIsDisabled()) return;
        this.chatService.sendMessage(this.messageInput);

        this.messageInput = this.DEFAULT_MESSAGE;
        this.input.nativeElement.focus();
    }

    ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.bubbles.nativeElement.scrollTop = this.bubbles.nativeElement.scrollHeight;
            // tslint:disable-next-line: no-empty
        } catch (err) {}
    }

    onFocus(): void {
        this.keyEventService.chatFocused = true;
        this.keyEventService.keyMask = new ColorKeyEventMask();
    }

    onBlur(): void {
        this.keyEventService.chatFocused = false;
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }

    sendIsDisabled(): boolean {
        return this.messageInput.replace(/[\t\n\r ]+/g, '').length === 0;
    }

    leave(): void {
        this.canauxService.leave();
    }
}
