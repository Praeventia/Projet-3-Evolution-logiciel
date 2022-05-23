import { Component, Input } from '@angular/core';
import { AlbumService, Request } from '@app/services/album/album.service';

@Component({
    selector: 'app-album-notification',
    templateUrl: './album-notification.component.html',
    styleUrls: ['./album-notification.component.scss'],
})
export class AlbumNotificationComponent {
    @Input() request: Request;

    constructor(public albumService: AlbumService) {}
}
