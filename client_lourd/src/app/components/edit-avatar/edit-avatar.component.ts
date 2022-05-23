import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '@app/components/image-cropper/image-cropper.component';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { ProfileService } from '@app/services/profile/profile.service';

@Component({
    selector: 'edit-avatar',
    templateUrl: './edit-avatar.component.html',
    styleUrls: ['./edit-avatar.component.scss'],
})
export class EditAvatarComponent implements OnInit {
    constructor(public profileService: ProfileService, public dialog: MatDialog, public avatarService: AvatarService) {}

    async ngOnInit(): Promise<void> {
        this.avatarService.getDefaultAvatars();
    }

    openImageCropperDialog(): void {
        this.dialog.closeAll();
        this.dialog.open(ImageCropperComponent);
    }
}
