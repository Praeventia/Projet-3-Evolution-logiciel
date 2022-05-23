import { Component, Input } from '@angular/core';
import { ConcoursService, Entry } from '@app/services/concours/concours.service';

@Component({
    selector: 'app-entry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
})
export class EntryComponent {
    @Input() entry: Entry;
    constructor(public concoursService: ConcoursService) {}
}
