import { Component, Input } from '@angular/core';
import { Concours } from '@app/services/concours/concours.service';

@Component({
    selector: 'app-concours-week',
    templateUrl: './concours-week.component.html',
    styleUrls: ['./concours-week.component.scss'],
})
export class ConcoursWeekComponent {
    @Input() concours: Concours;
}
