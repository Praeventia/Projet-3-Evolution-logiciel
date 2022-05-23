import { Injectable } from '@angular/core';
import { DrawingPasswordComponent } from '@app/components/album/drawing-password/drawing-password.component';
import { EditDrawingComponent } from '@app/components/album/edit-drawing/edit-drawing.component';
import { Drawing } from '@app/services/album/album.service';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingsService } from '@app/services/drawings/drawings.service';
import { HttpService } from '@app/services/http/http.service';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
@Injectable({
    providedIn: 'root',
})
export class EditorService {
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        private socketService: SocketService,
        private commandsService: CommandsService,
        private dialogService: DialogService,
        private drawingsService: DrawingsService,
    ) {}

    editorLoading: boolean = false;
    connectedUsers: string[] = [];

    async init(silent: boolean): Promise<void> {
        this.editorLoading = !silent;
        this.userService
            .waitForConnexion()
            .then(async () => {
                await this.drawingsService.init(true);
                await this.connectDrawing();
                await this.getCommands();
            })
            .finally(() => {
                this.editorLoading = false;
            });
    }

    async disconnect(): Promise<void> {
        this.socketService.disconnectDrawing();
    }

    async getCommands(): Promise<void> {
        this.httpService.get(`/drawings/allCommandsInDrawing/${this.drawingsService.getDrawingByPath()._id}`).then((result) => {
            this.commandsService.drawingID = this.drawingsService.getDrawingByPath()._id;
            this.commandsService.setCommandsFromServer(result);
        });
    }

    async getConnectedUsers(): Promise<void> {
        this.connectedUsers = [];
        await this.httpService.get(`/drawings/connectedUserInDrawing/${this.drawingsService.getDrawingByPath()._id}`).then(async (result) => {
            for (const value of result) {
                const username = await this.getUsernameFromID(value);
                this.connectedUsers.push(username);
            }
        });
    }

    async getUsernameFromID(userID: string): Promise<any> {
        const user = await this.httpService.get('/users/userInfo/' + userID, true);
        return user.username;
    }

    async connectDrawing(): Promise<void> {
        if (this.socketService.drawingConnected) return;
        if (this.drawingsService.getDrawingByPath().isExposed && !this.drawingsService.getDrawingByPath().joined) return;
        if (this.drawingsService.getDrawingByPath().isPasswordProtected && !this.drawingsService.getDrawingByPath().isOwner) {
            this.dialogService.openDialog(DrawingPasswordComponent).then(async (password) => {
                if (!password) return;
                await this.socketService.connectDrawing(this.drawingsService.getDrawingByPath(), password).then(() => {
                    this.drawingsService.getDrawingByPath().canEdit = true;
                });
            });
        } else {
            await this.socketService.connectDrawing(this.drawingsService.getDrawingByPath());
        }
    }

    edit(drawing?: Drawing): void {
        this.dialogService.openDialog(EditDrawingComponent, { drawing: drawing ?? this.drawingsService.getDrawingByPath() }).then((result) => {
            this.drawingsService.fetchDrawings();
        });
    }
}
