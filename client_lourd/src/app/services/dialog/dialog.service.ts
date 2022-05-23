import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { DialogKeyEventMask } from '@app/classes/key-event-masks/dialog-key-event-mask';
import { KeyEventMask } from '@app/classes/key-event-masks/key-event-mask';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { Observable, Subject } from 'rxjs';

// tslint:disable: no-any
@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog, private keyEventService: KeyEventService) {}
    dialogIsOpen: boolean = false;
    private closeSubject: Subject<any> = new Subject();
    notifyWhenClose(): Observable<any> {
        return this.closeSubject.asObservable();
    }
    emitClose(form: any): void {
        this.closeSubject.next(form);
    }

    async openDialog<T>(component: ComponentType<T>, data?: any): Promise<any> {
        this.keyEventService.keyMask = new DialogKeyEventMask();
        return new Promise((resolve) => {
            this.dialog
                .open(component, { data })
                .afterClosed()
                .subscribe(async (form: any) => {
                    this.exit();
                    resolve(form);
                });
            this.notifyWhenClose().subscribe((form: any) => {
                this.closeAll();
                resolve(form);
            });
        });
    }

    canOpen(mask: KeyEventMask): boolean {
        if (this.dialogIsOpen) return false;
        this.keyEventService.keyMask = mask;
        return (this.dialogIsOpen = true);
    }

    exit(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
        this.dialogIsOpen = false;
    }

    closeAll(): void {
        this.dialog.closeAll();
        this.exit();
    }
}
