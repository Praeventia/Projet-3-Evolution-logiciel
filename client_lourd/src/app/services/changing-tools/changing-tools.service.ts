import { Injectable } from '@angular/core';
import { keyForTools } from '@app/const';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChangingToolsService {
    constructor(private keyEventService: KeyEventService) {
        for (const key of Array.from(keyForTools.keys())) {
            this.keyEventService.getKeyDownEvent(keyForTools.get(key) as string).subscribe((event) => {
                if (!event.ctrlKey) this.currentTool = key;
            });
        }
    }

    private toolChanged: Subject<void> = new Subject<void>();
    private currentToolProp: ToolType = ToolType.pencil;
    private previousToolProp: ToolType;

    get currentTool(): ToolType {
        return this.currentToolProp;
    }

    set currentTool(value: ToolType) {
        this.previousToolProp = this.currentToolProp;
        this.currentToolProp = value;
        this.toolChanged.next();
    }

    get previousTool(): ToolType {
        return this.previousToolProp;
    }

    set previousTool(value: ToolType) {
        this.previousToolProp = value;
    }

    getToolChanged(): Observable<void> {
        return this.toolChanged.asObservable();
    }
}
