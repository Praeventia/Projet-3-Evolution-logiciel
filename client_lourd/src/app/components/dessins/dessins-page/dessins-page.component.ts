import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { AlbumService, Drawing } from '@app/services/album/album.service';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { FilterService } from '@app/services/filter/filter.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { LoginService } from '@app/services/login/login.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-dessins-page',
    templateUrl: './dessins-page.component.html',
    styleUrls: ['./dessins-page.component.scss'],
})
export class DessinsPageComponent implements OnInit, OnDestroy {
    constructor(
        public loginService: LoginService,
        public userService: UserService,
        private keyEventService: KeyEventService,
        public albumService: AlbumService,
        public drawingsService: DrawingsService,
        public chatHandlerService: ChatHandlerService,
        public socketService: SocketService,
        private router: Router,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }
    search: string = '';

    filteredDrawings: Drawing[] = [];

    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    filters: string[] = ['@public', '@protégé', '@exposé', '@propriétaire', '@contributions'];
    filterService: FilterService = new FilterService();

    interval: number;

    ngOnInit(): void {
        setTimeout(async () => {
            this.drawingsService.init(true).then(() => {
                this.filteredDrawings = this.drawingsService.filterDrawings(this.filterService.filters);
            });
            this.filterService.addFilter({ input: {} as HTMLInputElement, value: this.router.url.split('/')[2] } as MatChipInputEvent);
            this.filteredDrawings = this.drawingsService.filterDrawings(this.filterService.filters);

            this.filterService
                .filterChangedListener()
                .subscribe(() => (this.filteredDrawings = this.drawingsService.filterDrawings(this.filterService.filters)));
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
}
