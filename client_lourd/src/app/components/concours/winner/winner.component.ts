import { Component, Input } from '@angular/core';
import { ConcoursService, Entry } from '@app/services/concours/concours.service';

@Component({
    selector: 'app-winner',
    templateUrl: './winner.component.html',
    styleUrls: ['./winner.component.scss'],
})
export class WinnerComponent {
    hovering: boolean = false;
    @Input() winner: Entry;
    @Input() position: number;
    constructor(public concoursService: ConcoursService) {}
}
