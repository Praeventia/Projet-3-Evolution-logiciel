import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColorKeyEventMask } from '@app/classes/key-event-masks/color-key-event-mask';
import { DefaultKeyEventMask } from '@app/classes/key-event-masks/default-key-event-mask';
import { HTTP_STATUS_CONFLICT, MAX_DRAWING_NAME } from '@app/const';
import { Album, AlbumService, Drawing } from '@app/services/album/album.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

@Component({
    selector: 'app-edit-drawing',
    templateUrl: './edit-drawing.component.html',
    styleUrls: ['./edit-drawing.component.scss'],
})
export class EditDrawingComponent implements OnInit {
    constructor(
        // tslint:disable-next-line: no-any
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogService: DialogService,
        public albumService: AlbumService,
        private keyEventService: KeyEventService,
        private httpService: HttpService,
        private snackBarService: SnackBarService,
    ) {}

    prevName: string;
    prevDescription: string;
    readonly MAX_TITLE_SIZE: number = MAX_DRAWING_NAME;
    titleFormControl: FormControl = new FormControl(this.data.drawing.name, [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_TITLE_SIZE),
    ]);

    passwordFormControl: FormControl = new FormControl('');

    enablePassword: FormControl = new FormControl(this.data.drawing.isPasswordProtected);

    albumFormControl: FormControl = new FormControl('');

    ngOnInit(): void {
        setTimeout(async () => {
            await this.albumService.init(true);
            this.albumFormControl.setValue(this.albumService.getAlbum(this.data.drawing.album._id).name);
        }, 0);
    }

    // tslint:disable-next-line: cyclomatic-complexity
    async tryEdit(): Promise<void> {
        if (this.titleFormControl.invalid || this.passwordFormControl.invalid) return;

        const name = this.titleFormControl.value;
        const passwordEnabled = this.enablePassword.value;
        const password = this.passwordFormControl.value;

        const drawing = {
            _id: this.data.drawing._id,
            name,
        } as Drawing;
        if (!this.titleFormControl.dirty && !this.enablePassword.dirty && !this.passwordFormControl.dirty && !this.albumFormControl.dirty) {
            this.dialogService.closeAll();
            return;
        }

        if (drawing.name !== this.data.drawing.name && this.titleFormControl.valid) {
            this.changeName(drawing).catch(() => {
                this.titleFormControl.setErrors({ conflict: true });
            });
        }

        if (
            this.albumFormControl.valid &&
            this.albumFormControl.dirty &&
            this.albumFormControl.value !== '' &&
            this.albumFormControl.value !== this.data.drawing.album.name
        ) {
            const album = this.albumService.getAlbumByName(this.albumFormControl.value);
            if (!album) {
                this.albumFormControl.setErrors({ invalid: true });
            } else {
                await this.changeAlbum(drawing, album._id)
                    .then(() => {
                        this.albumService.fetchAlbums();
                    })
                    .catch(() => {
                        this.albumFormControl.setErrors({ invalid: true });
                    });
            }
        }

        if (this.albumService.getAlbumByName(this.albumFormControl.value).name !== 'Public') return;

        if (
            passwordEnabled &&
            this.passwordFormControl.valid &&
            password !== '' &&
            this.passwordFormControl.dirty &&
            this.data.drawing.isPasswordProtected
        ) {
            this.changePassword(drawing, password);
        }
        if (
            passwordEnabled &&
            this.passwordFormControl.valid &&
            password !== '' &&
            this.passwordFormControl.dirty &&
            !this.data.drawing.isPasswordProtected
        ) {
            this.changeProtection(drawing, password);
        }
        if (!passwordEnabled && this.data.drawing.isPasswordProtected) {
            this.changeProtection(drawing);
        }
    }

    resetErrors(): void {
        if (this.titleFormControl.hasError('conflict')) {
            this.titleFormControl.setErrors({ conflict: null });
            this.titleFormControl.updateValueAndValidity();
        }
    }

    filterAlbums(value: string): Album[] {
        const joinedAlbumsExcludingCurrent = this.albumService.joinedAlbums.filter((album) => album._id !== this.data.drawing.album._id);
        if (value === '') return joinedAlbumsExcludingCurrent;
        const filterValue = value.toLowerCase();
        return joinedAlbumsExcludingCurrent.filter((album: Album) => album.name.toLowerCase().startsWith(filterValue));
    }

    onFocus(): void {
        this.albumService.fetchAlbums();
        this.keyEventService.keyMask = new ColorKeyEventMask();
    }

    onBlur(): void {
        this.keyEventService.keyMask = new DefaultKeyEventMask();
    }

    async changeName(drawing: Drawing): Promise<void> {
        await this.httpService
            .post('/drawings/changeDrawingName?=', { drawingID: drawing._id, name: drawing.name })
            .then(() => {
                this.snackBarService.openSnackBar("Nom de l'album modifié avec succès");
                this.dialogService.closeAll();
            })
            .catch((error) => {
                if (error.status === HTTP_STATUS_CONFLICT) {
                    this.snackBarService.openSnackBar("ce nom d'album existe déjà");
                    throw error;
                }
                this.snackBarService.openSnackBar("Impossible de modifier le nom de l'album");
            });
    }

    async changeProtection(drawing: Drawing, password?: string): Promise<void> {
        await this.httpService
            .post('/drawings/changeProtection', {
                drawingID: drawing._id,
                password,
            })
            .then(() => {
                this.snackBarService.openSnackBar('Protection modifié avec succès');
                this.dialogService.closeAll();
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de modifier la protection');
            });
    }

    async changeAlbum(drawing: Drawing, albumId: string): Promise<void> {
        await this.httpService.post('/albums/changeDrawingAlbum', { drawingID: drawing._id, albumID: albumId }).then(async () => {
            this.snackBarService.openSnackBar('Album modifié avec succès');
            this.dialogService.closeAll();
        });
    }

    async changePassword(drawing: Drawing, password: string): Promise<void> {
        await this.httpService.post('/drawings/changePassword', { drawingID: drawing._id, password }).then(() => {
            this.snackBarService.openSnackBar('Mot de passe modifié avec succès');
            this.dialogService.closeAll();
        });
    }
}
