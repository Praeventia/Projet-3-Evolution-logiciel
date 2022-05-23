import { Component, HostListener } from '@angular/core';
import { AlbumService } from '@app/services/album/album.service';
import { CanauxService } from '@app/services/canaux/canaux.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { UserService } from '@app/services/user/user.service';
import { ToolType } from '@app/tool-type';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        private keyEventService: KeyEventService,
        private selectionService: SelectionService,
        public canauxService: CanauxService,
        public userService: UserService,
        public albumService: AlbumService,
    ) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.keyEventService.currentTool === ToolType.selection) {
            this.selectionService.onKeyDown(event);
        } else {
            this.keyEventService.onKeyDown(event);
        }
    }
}
