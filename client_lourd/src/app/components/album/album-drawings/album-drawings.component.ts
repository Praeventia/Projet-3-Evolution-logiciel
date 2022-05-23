import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { CreateDrawingComponent } from '@app/components/album/create-drawing/create-drawing.component';
import { Album, AlbumService, Drawing } from '@app/services/album/album.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { FilterService } from '@app/services/filter/filter.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-album-drawings',
    templateUrl: './album-drawings.component.html',
    styleUrls: ['./album-drawings.component.scss'],
})
export class AlbumDrawingsComponent implements OnInit, OnDestroy {
    constructor(
        public drawingsService: DrawingsService,
        private keyEventService: KeyEventService,
        public albumService: AlbumService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
        private dialogService: DialogService,
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private snackBarService: SnackBarService,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }
    filteredDrawings: Drawing[] = [];
    filterService: FilterService = new FilterService();

    prevDescription: string;
    search: string;
    filters: string[] = ['@propriétaire', '@contributions'];

    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    separatorKeysCodes: number[] = [ENTER, COMMA];
    interval: number;

    ngOnInit(): void {
        setTimeout(async () => {
            if (!this.albumService.albumExistsByPath()) {
                this.router.navigate(['/albums']);
                this.snackBarService.openSnackBar("Cet album n'existe plus");
                return;
            }
            this.drawingsService.init(true).then(() => this.filter());
            this.filter();

            this.filterService
                .filterChangedListener()
                .subscribe(
                    () =>
                        (this.filteredDrawings = this.drawingsService.filterDrawings(this.filterService.filters, this.albumService.getAlbumByPath())),
                );
            this.drawingsService.notifyDrawingsUpdated().subscribe(() => {
                this.filteredDrawings = this.drawingsService.filterDrawings(this.filterService.filters, this.albumService.getAlbumByPath());
            });
        });

        const INTERVAL = 5000;

        this.interval = setInterval(() => {
            this.drawingsService.init(true);
        }, INTERVAL);
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }
    autoCompleteFilters(): string[] {
        return this.filters.filter((filter) => filter.includes(this.search));
    }

    filter(): void {
        this.filteredDrawings = this.drawingsService.filterDrawings(this.filterService.filters, this.albumService.getAlbumByPath());
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.filterService.addFilter({ input: {} as HTMLInputElement, value: event.option.value } as MatChipInputEvent);

        this.input.nativeElement.value = '';
    }

    onFocus(): void {
        this.keyEventService.keyMask = new ColorKeyEventMask();
    }

    onBlur(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }
    albumName(): string {
        return this.albumService.getAlbumByPath()?.joined
            ? 'album ' + (this.albumService.getAlbumByPath()?.name ?? '')
            : "exposition de l'album " + (this.albumService.getAlbumByPath()?.name ?? '');
    }

    create(album?: Album): void {
        this.dialogService
            .openDialog(CreateDrawingComponent, { album: album ?? this.albumService.getAlbumByPath() })
            .then(() => this.drawingsService.fetchDrawings());
    }
}
