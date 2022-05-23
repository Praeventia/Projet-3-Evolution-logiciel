import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-exposition',
    templateUrl: './exposition.component.html',
    styleUrls: ['./exposition.component.scss'],
})
export class ExpositionComponent {
    // tslint:disable-next-line: no-any
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
