import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatHandlerService } from '@app/services/chat-handler/chat-handler.service';
import { ConcoursService } from '@app/services/concours/concours.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { EditorService } from '@app/services/editor/editor.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, OnDestroy {
    constructor(
        public chatHandler: ChatHandlerService,
        public socketService: SocketService,
        public editorService: EditorService,
        public drawingsService: DrawingsService,
        public concoursService: ConcoursService,
        public dialog: MatDialog,
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private snackBarService: SnackBarService,
    ) {
        this.socketService.notifyChatConnected().subscribe(() => {
            this.changeDetector.detectChanges();
        });
    }

    interval: number;

    ngOnInit(): void {
        if (!this.drawingsService.drawingExistsByPath()) {
            this.router.navigate(['/home']);
            this.snackBarService.openSnackBar("Ce dessin n'existe plus");
            return;
        }
        this.editorService.init(false);
    }

    ngOnDestroy(): void {
        this.editorService.disconnect();
        clearInterval(this.interval);
    }

    editorName(): string {
        return this.drawingsService.getDrawingByPath()?.isPasswordProtected && !this.socketService.drawingConnected
            ? 'vue de ' + (this.drawingsService.getDrawingByPath()?.name ?? '')
            : 'édition de ' + (this.drawingsService.getDrawingByPath()?.name ?? '');
    }
}
