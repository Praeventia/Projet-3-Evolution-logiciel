import { ChangeDetectorRef, Component } from '@angular/core';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { CreateCanalComponent } from '@app/components/canaux/create-canal/create-canal.component';
import { Canal, CanauxService } from '@app/services/canaux/canaux.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';

@Component({
    selector: 'app-canaux-display',
    templateUrl: './canaux-display.component.html',
    styleUrls: ['./canaux-display.component.scss'],
})
export class ChatCanauxComponent {
    searchedCanal: string = '';

    constructor(
        private keyEventService: KeyEventService,
        private chatHandler: ChatHandlerService,
        public canauxService: CanauxService,
        private dialogService: DialogService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.canauxService.notifyWhenCanalUpdate().subscribe(() => {
            this.changeDetector.detectChanges();
        });

        this.chatHandler.notifyChatVisibilityChange().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }

    filteredCanaux: Canal[];
    async createDialog(): Promise<void> {
        await this.dialogService.openDialog(CreateCanalComponent);
    }

    filterCanaux(value: string): Canal[] {
        if (value === '') return this.canauxService.canaux;
        const filterValue = value.toLowerCase();
        return this.canauxService.canaux.filter((canal: Canal) => canal.name.toLowerCase().startsWith(filterValue));
    }

    onFocus(): void {
        this.canauxService.updateCanaux(true);
        this.keyEventService.keyMask = new ColorKeyEventMask();
    }

    onBlur(): void {
        this.canauxService.updateCanaux(true);
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }
}
