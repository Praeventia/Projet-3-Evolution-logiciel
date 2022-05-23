import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAX_ALBUM_DESCRIPTION, MAX_ALBUM_NAME } from '@app/const';
import { Album, AlbumService } from '@app/services/album/album.service';

@Component({
    selector: 'app-create-album',
    templateUrl: './create-album.component.html',
    styleUrls: ['./create-album.component.scss'],
})
export class CreateAlbumComponent {
    constructor(private albumService: AlbumService) {}

    readonly MAX_TITLE_SIZE: number = MAX_ALBUM_NAME;
    titleFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_TITLE_SIZE),
    ]);
    readonly MAX_DESCRIPTION_SIZE: number = MAX_ALBUM_DESCRIPTION;

    descriptionFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9-_ ]*'),
        Validators.maxLength(this.MAX_DESCRIPTION_SIZE),
    ]);

    async tryCreate(): Promise<void> {
        if (this.titleFormControl.invalid || this.descriptionFormControl.invalid) return;

        const name = this.titleFormControl.value;
        const description = this.descriptionFormControl.value;

        const album = {
            name,
            description,
            isPublic: false,
            isOwner: true,
        } as Album;

        await this.albumService.tryCreate(album).catch(() => {
            this.titleFormControl.setValue('');
            this.titleFormControl.setErrors({ conflict: true });
        });
    }

    resetErrors(): void {
        if (this.titleFormControl.hasError('conflict')) {
            this.titleFormControl.setErrors({ conflict: null });
            this.titleFormControl.updateValueAndValidity();
        }
    }
}
