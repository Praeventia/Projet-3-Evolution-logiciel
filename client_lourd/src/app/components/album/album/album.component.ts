import { Component, Input } from '@angular/core';
import { CreateDrawingComponent } from '@app/components/album/create-drawing/create-drawing.component';
import { Album, AlbumService } from '@app/services/album/album.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';

@Component({
    selector: 'app-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.scss'],
})
export class AlbumComponent {
    @Input() album: Album;
    constructor(public albumService: AlbumService, public drawingsService: DrawingsService, public dialogService: DialogService) {}
    create(album?: Album): void {
        this.dialogService
            .openDialog(CreateDrawingComponent, { album: album ?? this.albumService.getAlbumByPath() })
            .then(() => this.drawingsService.fetchDrawings());
    }
}
