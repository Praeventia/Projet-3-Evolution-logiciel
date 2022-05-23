import { Injectable } from '@angular/core';
import { DEFAULT_TOOL_SIZE } from '@app/const';
import { ToolType } from '@app/tool-type';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ToolsInfoService {
    constructor() {
        Object.values(ToolType).forEach((tool: ToolType) => {
            this.toolSizes.set(tool, DEFAULT_TOOL_SIZE);
        });
    }

    private subjectNewDrawing: Subject<null> = new Subject<null>();

    toolSizes: Map<ToolType, number> = new Map<ToolType, number>();

    getSizeOf(tool: ToolType): number {
        return this.toolSizes.get(tool) as number;
    }

    setSizeOf(tool: ToolType, size: number): void {
        if (this.toolSizes.has(tool)) {
            this.toolSizes.set(tool, size);
        } else {
            throw new Error('Unknown tooltype');
        }
    }

    setNewDrawing(): void {
        this.subjectNewDrawing.next();
    }

    getNewDrawing(): Observable<null> {
        return this.subjectNewDrawing.asObservable();
    }
}
