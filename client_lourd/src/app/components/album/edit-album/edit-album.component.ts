import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HTTP_STATUS_CONFLICT, MAX_ALBUM_DESCRIPTION, MAX_ALBUM_NAME } from '@app/const';
import { Album } from '@app/services/album/album.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

@Component({
    selector: 'app-edit-album',
    templateUrl: './edit-album.component.html',
    styleUrls: ['./edit-album.component.scss'],
})
export class EditAlbumComponent {
    constructor(
        // tslint:disable-next-line: no-any
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogService: DialogService,
        private httpService: HttpService,
        private snackBarService: SnackBarService,
    ) {}

    prevName: string;
    prevDescription: string;
    readonly MAX_TITLE_SIZE: number = MAX_ALBUM_NAME;
    titleFormControl: FormControl = new FormControl(this.data.album.name, [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_TITLE_SIZE),
    ]);
    readonly MAX_DESCRIPTION_SIZE: number = MAX_ALBUM_DESCRIPTION;

    descriptionFormControl: FormControl = new FormControl(this.data.album.description, [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_DESCRIPTION_SIZE),
    ]);

    async tryEdit(): Promise<void> {
        if (this.titleFormControl.invalid || this.descriptionFormControl.invalid) return;

        const name = this.titleFormControl.value;
        const description = this.descriptionFormControl.value;

        const editedAlbum = {
            _id: this.data.album._id,
            name,
            description,
        } as Album;

        if (editedAlbum.name === this.data.album.name && editedAlbum.description === this.data.album.description) {
            this.dialogService.closeAll();
            return;
        }
        if (editedAlbum.name !== this.data.album.name && this.titleFormControl.valid) {
            this.changeName(editedAlbum).catch(() => {
                this.titleFormControl.setErrors({ conflict: true });
            });
        }
        if (editedAlbum.description !== this.data.album.description && this.descriptionFormControl.valid) {
            this.changeDescription(editedAlbum);
        }
    }

    resetErrors(): void {
        if (this.titleFormControl.hasError('conflict')) {
            this.titleFormControl.setErrors({ conflict: null });
            this.titleFormControl.updateValueAndValidity();
        }
    }

    async changeName(album: Album): Promise<void> {
        await this.httpService
            .post('/albums/changeAlbumName', { albumID: album._id, albumName: album.name })
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

    async changeDescription(album: Album): Promise<void> {
        await this.httpService
            .post('/albums/changeDescription', { albumID: album._id, description: album.description })
            .then(async () => {
                this.snackBarService.openSnackBar("Description de l'album modifiée avec succès");
                this.dialogService.closeAll();
            })
            .catch(async () => {
                this.snackBarService.openSnackBar("Impossible de modifier la description de l'album");
            });
    }
}
