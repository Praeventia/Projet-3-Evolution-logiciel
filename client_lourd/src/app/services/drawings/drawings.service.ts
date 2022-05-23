import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ExpositionComponent } from '@app/components/album/exposition/exposition.component';
import { HTTP_STATUS_CONFLICT, HTTP_STATUS_NOT_ACCEPTABLE, IMAGE_NOT_FOUND_PATH } from '@app/const';
import { Album, AlbumService, Drawing } from '@app/services/album/album.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DrawingsService {
    constructor(
        private httpService: HttpService,
        private router: Router,
        private dialogService: DialogService,
        private snackBarService: SnackBarService,
        private albumService: AlbumService,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private userService: UserService,
    ) {}

    readonly dateOptions: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    drawings: Drawing[] = [];

    isLoadingDrawings: boolean = false;

    private drawingsUpdatedSubject: Subject<void> = new Subject<void>();

    async init(silent: boolean): Promise<void> {
        this.isLoadingDrawings = !silent || this.drawings.length === 0;
        await this.userService
            .waitForConnexion()
            .then(async () => {
                await this.albumService.init(true);
                await this.fetchDrawings();
            })
            .finally(() => {
                this.isLoadingDrawings = false;
            });
    }

    getDrawingByPath(): Drawing {
        return this.drawings.find((drawing) => drawing._id === this.router.url.split('/')[2]) as Drawing;
    }

    getDrawingsByPath(): Drawing[] {
        return this.drawings.filter((drawing) => drawing.album._id === this.router.url.split('/')[2]);
    }

    getDrawingById(drawingId: string): Drawing {
        return this.drawings.find((drawing) => drawing._id === drawingId) as Drawing;
    }
    notifyDrawingsUpdated(): Observable<void> {
        return this.drawingsUpdatedSubject.asObservable();
    }

    async drawingExistsByPath(): Promise<boolean> {
        const drawingId = this.router.url.split('/')[2];
        return this.httpService
            .get('/drawings/drawingInfo/' + drawingId)
            .then(async (res: any) => {
                return true;
            })
            .catch(async (error) => {
                if (error.error.status === HTTP_STATUS_NOT_ACCEPTABLE && error.error.error === 'Drawing not found') {
                    return false;
                }
                return false;
            });
    }

    async fetchDrawings(): Promise<void> {
        const drawings: Drawing[] = [];

        await Promise.all(
            this.albumService.albums.map(async (album) => {
                return this.fetchDrawing(album).then((drawing: Drawing[]) => {
                    drawings.push(...drawing);
                });
            }),
        );

        this.drawings = drawings.sort((a: Drawing, b: Drawing) => {
            return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
        });

        this.drawingsUpdatedSubject.next();
    }

    sortDrawings(): void {
        this.drawings.sort((a: Drawing, b: Drawing) => {
            return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
        });
    }

    async fetchDrawing(album: Album): Promise<Drawing[]> {
        const drawings: Drawing[] = [];
        const drawingIds = album.joined
            ? await this.httpService.get(`/albums/allDrawingInAlbum/${album._id}`)
            : await this.httpService.get(`/albums/allExposedDrawingInAlbum/${album._id}`);

        const contributions = await this.httpService.get('/drawings/allDrawingsContributed');
        await Promise.all(
            drawingIds.map(async (drawingId: string) => {
                return this.httpService
                    .get(`/drawings/drawingInfo/${drawingId}`)
                    .then(async (drawing) => {
                        drawings.push({
                            _id: drawingId,
                            name: drawing.drawingName,
                            isPasswordProtected: drawing.isPasswordProtected,
                            isPublic: drawing.isPublic,
                            isOwner: drawing.owner === this.userService.user?._id,
                            owner: drawing.owner,
                            creationDate: drawing.creationDate,
                            isExposed: drawing.isExposed,
                            album: this.albumService.getAlbum(drawing.albumID),
                            contributed: contributions.includes(drawingId),
                        } as Drawing);
                    })
                    .catch(() => []);
            }),
        );

        drawings.map(async (drawing: Drawing) => {
            drawing.joined = album.joined;
        });

        if (album.joined)
            await Promise.all(
                drawings.map(async (drawing: Drawing) => {
                    return this.httpService.get('/users/userInfo/' + drawing.owner).then((res) => {
                        drawing.ownerName = res.username;
                        drawing.ownerEmail = !res.isPasswordProtected ? res.email : undefined;
                    });
                }),
            );

        if (album.joined)
            await Promise.all(
                drawings.map(async (drawing: Drawing) => {
                    return this.httpService.get(`/drawings/connectedUserInDrawing/${drawing._id}`).then((users) => (drawing.connectedUsers = users));
                }),
            );

        await Promise.all(
            drawings.map(async (drawing: Drawing) => {
                return await new Promise(async (resolve) => {
                    const url = environment.SERVER_BASE + '/image/drawing/' + drawing._id;
                    const image = await this.http.get(url, { responseType: 'blob' }).toPromise();
                    const base64 = await this.convertBlobToBase64(image);
                    const sanitizedImage = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
                    drawing.url = sanitizedImage;
                    if (drawing.album.url === IMAGE_NOT_FOUND_PATH) drawing.album.url = sanitizedImage;
                    resolve(null);
                });
            }),
        );
        return drawings;
    }

    async convertBlobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                resolve((reader.result as any).toString());
            };
            reader.readAsDataURL(blob);
        });
    }

    downloadGif(drawing: Drawing): void {
        const imageUrl = environment.SERVER_BASE + '/image/gif/' + drawing._id;
        this.http.get(imageUrl, { responseType: 'blob' }).subscribe((res) => {
            const blob = new Blob([res], { type: 'image/gif' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = drawing.name + '.gif';
            link.click();
        });
    }

    async createDrawing(drawing: Drawing, password?: string): Promise<void> {
        await this.httpService
            .put('/albums/createDrawing', { drawingName: drawing.name, albumID: drawing.album._id, password })
            .then(async () => {
                this.dialogService.closeAll();
                this.fetchDrawings();
            })
            .catch(async (error) => {
                this.fetchDrawings();
                if (error.status === HTTP_STATUS_CONFLICT) throw error;
            });
    }

    async view(drawing: Drawing): Promise<void> {
        if (drawing.isExposed && !drawing.joined) {
            this.dialogService.openDialog(ExpositionComponent, { url: drawing.url });
        } else {
            this.router.navigate(['/editor/' + drawing._id]);
        }
    }

    async delete(drawing: Drawing, redirect: boolean): Promise<void> {
        await this.httpService
            .post('/albums/deleteDrawing/', { drawingID: drawing._id })
            .then(async () => {
                this.snackBarService.openSnackBar('Dessin supprimé avec succès');
                if (redirect) this.router.navigate(['/album/' + drawing.album._id]);
                this.fetchDrawings();
            })
            .catch(async (error) => {
                this.snackBarService.openSnackBar('Erreur lors de la suppression du dessin');
                this.fetchDrawings();
            });
    }

    async toggleExposition(event: Event, drawing: Drawing): Promise<void> {
        event.stopPropagation();
        await this.httpService
            .post('/drawings/changeDrawingExposition', { drawingID: drawing._id })
            .then(async () => {
                this.snackBarService.openSnackBar('Exposition modifiée avec succès');
                this.fetchDrawings();
            })
            .catch(async () => {
                this.fetchDrawings();
            });
    }

    filterDrawings(filters: string[], album?: Album): Drawing[] {
        let filteredDrawings: Drawing[] = album ? this.drawings.filter((drawing) => drawing.album._id === album._id) : this.drawings;

        for (const filter of filters) {
            switch (filter) {
                case '@public':
                    filteredDrawings = filteredDrawings.filter((drawing) => drawing.isPublic);
                    break;
                case '@protégé':
                    filteredDrawings = filteredDrawings.filter((drawing) => drawing.isPasswordProtected);
                    break;
                case '@exposé':
                    filteredDrawings = filteredDrawings.filter((drawing) => drawing.isExposed);
                    break;
                case '@contributions':
                    filteredDrawings = filteredDrawings.filter((drawing) => drawing.contributed);
                    break;
                case '@propriétaire':
                    filteredDrawings = filteredDrawings.filter((drawing) => drawing.isOwner);
                    break;
                default:
                    filteredDrawings = filteredDrawings.filter(
                        (drawing) =>
                            drawing.name?.toLowerCase().includes(filter.toLowerCase()) ||
                            drawing.ownerName?.toLowerCase().includes(filter.toLowerCase()) ||
                            (drawing.ownerEmail && drawing.ownerEmail.toLowerCase().includes(filter.toLowerCase())) ||
                            new Date(drawing.creationDate).toLocaleDateString('fr', this.dateOptions).includes(filter.toLowerCase()),
                    );

                    break;
            }
        }
        return filteredDrawings;
    }
}
