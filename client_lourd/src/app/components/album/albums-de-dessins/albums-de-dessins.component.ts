import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { CreateAlbumComponent } from '@app/components/album/create-album/create-album.component';
import { Album, AlbumService } from '@app/services/album/album.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LoginService } from '@app/services/login/login.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-album-page',
    templateUrl: './albums-de-dessins.component.html',
    styleUrls: ['./albums-de-dessins.component.scss'],
})
export class AlbumsDeDessinsComponent implements OnInit, OnDestroy {
    constructor(
        public loginService: LoginService,
        public userService: UserService,
        public albumService: AlbumService,
        private dialogService: DialogService,
        private keyEventService: KeyEventService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
        const INTERVAL = 5000;

        this.interval = setInterval(() => {
            this.albumService.init(true);
        }, INTERVAL);
    }
    interval: number;

    ngOnInit(): void {
        this.albumService.init(true);
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }

    filterAlbums(value: string): Album[] {
        if (value === '') return this.albumService.albums;
        const filterValue = value.toLowerCase();
        return this.albumService.albums.filter((album: Album) => album.name.toLowerCase().startsWith(filterValue));
    }

    async createDialog(): Promise<void> {
        await this.dialogService.openDialog(CreateAlbumComponent);
    }

    onFocus(): void {
        this.albumService.fetchAlbums();
        this.keyEventService.keyMask = new ColorKeyEventMask();
    }

    onBlur(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }
}
