import { Component, Input } from '@angular/core';
import { Drawing } from '@app/services/album/album.service';
import { ConcoursService } from '@app/services/concours/concours.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { EditorService } from '@app/services/editor/editor.service';

@Component({
    selector: 'app-album-drawing',
    templateUrl: './album-drawing.component.html',
    styleUrls: ['./album-drawing.component.scss'],
})
export class AlbumDrawingComponent {
    @Input() drawing: Drawing;
    constructor(public drawingsService: DrawingsService, public concoursService: ConcoursService, public editorService: EditorService) {}
}
