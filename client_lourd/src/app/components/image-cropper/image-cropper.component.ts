// tslint:disable: no-any
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { ProfileService } from '@app/services/profile/profile.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { base64ToFile, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
    selector: 'app-image-cropper',
    templateUrl: './image-cropper.component.html',
    styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent {
    sourceImageB64: any;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    hasImage: boolean = false;
    files: NgxFileDropEntry[] = [];
    showSpinner: boolean = false;

    constructor(
        public profileService: ProfileService,
        public matDialog: MatDialog,
        public userService: UserService,
        public avatarService: AvatarService,
        public snackBar: SnackBarService,
    ) {}

    dropped(files: NgxFileDropEntry[]): void {
        this.files = files;
        for (const droppedFile of files) {
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file(async (file: File) => {
                    if (file.type === 'image/jpeg' || file.type === 'image/png') {
                        const imgBase64 = await this.toBase64(file);
                        this.sourceImageB64 = imgBase64;
                        this.hasImage = true;
                        this.showSpinner = true;
                    } else {
                        this.snackBar.openSnackBar("Ce fichier n'est pas de type .jpeg ou .png");
                    }
                });
            }
        }
    }

    async toBase64(file: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    fileChangeEvent(event: HTMLInputElement): void {
        this.imageChangedEvent = event;
        this.hasImage = true;
        this.showSpinner = true;
    }

    imageCropped(event: ImageCroppedEvent): void {
        this.croppedImage = event.base64;
    }

    cancelAvatar(): void {
        this.hasImage = false;
        this.showSpinner = false;
        this.matDialog.closeAll();
    }

    confirmAvatar(): void {
        const imageBlob = base64ToFile(this.croppedImage);
        const imageFile = new File([imageBlob], 'image.png', {
            type: imageBlob.type,
        });
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        this.avatarService.setCustomAvatar(imageFormData, this.croppedImage);
        this.cancelAvatar();
    }

    setShowSpinner(value: boolean): void {
        this.showSpinner = value;
    }
}
