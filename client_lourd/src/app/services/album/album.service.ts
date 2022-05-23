// tslint:disable: max-file-line-count
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EditAlbumComponent } from '@app/components/album/edit-album/edit-album.component';
import { HTTP_STATUS_CONFLICT, HTTP_STATUS_NOT_ACCEPTABLE, IMAGE_NOT_FOUND_PATH } from '@app/const';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface Album {
    _id: string;
    name: string;
    description: string;
    isOwner: boolean;
    isPublic: boolean;
    joined: boolean;
    hasExpositions: boolean;
    url?: SafeResourceUrl;
}

export interface Drawing {
    _id: string;
    name: string;
    connectedUsers: string[] | undefined;
    isExposed: boolean;
    isPublic: boolean;
    isPasswordProtected: boolean;
    isOwner: boolean;
    owner: string;
    ownerName: string;
    ownerEmail?: string;
    creationDate: Date;
    album: Album;
    url: SafeResourceUrl;
    joined?: boolean;
    gifUrl?: SafeResourceUrl;
    contributed: boolean;
    canEdit?: boolean;
}

export interface Request {
    albumId: string;
    userId: string;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class AlbumService {
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        private dialogService: DialogService,
        private snackBarService: SnackBarService,
        private router: Router,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
    ) {}

    get joinedAlbums(): Album[] {
        return this.albums.filter((albums) => albums.joined);
    }

    get unjoinedAlbums(): Album[] {
        return this.albums.filter((albums) => !albums.joined);
    }

    get myAlbums(): Album[] {
        return this.albums.filter((album) => album.isOwner);
    }

    albums: Album[] = [];

    requests: Map<string, Request[]> = new Map();

    isLoadingAlbums: boolean = false;

    private albumUpdatedSubject: Subject<void> = new Subject<void>();

    getAlbum(albumId: string): Album {
        return this.albums.find((album) => album._id === albumId) as Album;
    }

    getAlbumByName(albumName: string): Album {
        return this.albums.find((album) => album.name === albumName) as Album;
    }

    getAlbumByPath(): Album {
        return this.albums.find((album) => album._id === this.router.url.split('/')[2]) as Album;
    }

    notifyAlbumUpdated(): Observable<void> {
        return this.albumUpdatedSubject.asObservable();
    }

    async albumExistsByPath(): Promise<boolean> {
        const albumId = this.router.url.split('/')[2];
        return this.httpService
            .get('/albums/albumInfo/' + albumId)
            .then(async (res: any) => {
                return true;
            })
            .catch(async (error) => {
                if (error.error.status === HTTP_STATUS_NOT_ACCEPTABLE && error.error.error === "Cette album n'existe pas") {
                    return false;
                }
                return false;
            });
    }

    async init(silent: boolean): Promise<void> {
        this.isLoadingAlbums = !silent || this.albums.length === 0;

        await this.userService
            .waitForConnexion()
            .then(async () => {
                await this.fetchAlbums();
                await this.getAllRequests();
            })
            .finally(() => {
                this.isLoadingAlbums = false;
            });
    }

    async fetchAlbums(): Promise<void> {
        let albums: Album[] = [];
        await this.httpService.get('/albums/allAlbum').then((result) => {
            albums = result.map((album: any) => {
                return {
                    _id: album.albumID,
                    name: album.albumName,
                    description: album.albumDescription,
                    isOwner: album.isOwner,
                    isPublic: album.albumName === 'Public',
                    joined: album.isJoin,
                    url: IMAGE_NOT_FOUND_PATH,
                };
            });
        });

        await Promise.all(
            albums.map(async (album) => {
                return this.httpService.get(`/albums/allExposedDrawingInAlbum/${album._id}`).then((result) => {
                    album.hasExpositions = result.length > 0;
                });
            }),
        );
        await Promise.all(
            albums.map(async (album) => {
                if (album.joined)
                    return this.getFirstImage(album._id).then((url) => {
                        album.url = url ?? IMAGE_NOT_FOUND_PATH;
                    });
            }),
        );
        this.albums = albums;
        this.isLoadingAlbums = false;
        this.albumUpdatedSubject.next();
    }

    async getFirstImage(albumId: string): Promise<SafeResourceUrl | undefined> {
        const drawingId = (await this.httpService.get(`/albums/allDrawingInAlbum/${albumId}`))[0];
        if (drawingId) {
            return new Promise(async (resolve) => {
                const url = environment.SERVER_BASE + '/image/drawing/' + drawingId;
                this.http
                    .get(url, { responseType: 'blob' })
                    .toPromise()
                    .then(async (image) => {
                        const base64 = await this.convertBlobToBase64(image);
                        const sanitizedImage = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
                        resolve(sanitizedImage);
                    })
                    .catch(() => {
                        resolve(undefined);
                    });
            });
        } else {
            return undefined;
        }
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

    private addAlbum(album: Album): void {
        const index = this.albums.findIndex((a) => a._id === album._id);
        // tslint:disable-next-line: no-magic-numbers
        if (index === -1) this.albums.push(album);
        else this.albums[index] = album;
    }

    private removeAlbum(album: Album): void {
        const index = this.albums.findIndex((a) => a._id === album._id);
        // tslint:disable-next-line: no-magic-numbers
        if (index !== -1) this.albums.splice(index, 1);
    }

    async tryCreate(album: Album): Promise<void> {
        await this.httpService
            .put('/albums/createAlbum', { albumName: album.name, description: album.description, isPublic: album.isPublic })
            .then(() => {
                this.addAlbum(album);
                this.snackBarService.openSnackBar('Album créé avec succès');
                this.dialogService.closeAll();
                this.fetchAlbums();
            })
            .catch((error) => {
                if (error.status === HTTP_STATUS_CONFLICT) throw error;
            });
    }

    async join(album: Album): Promise<void> {
        album.isPublic ? await this.joinPublic(album) : await this.requestJoinPrivate(album);
    }

    async joinPublic(album: Album): Promise<void> {
        this.addAlbum(album);
        await this.httpService
            .post('/albums/requestToJoinPublicAlbum', { albumID: album._id })
            .then(() => {
                this.snackBarService.openSnackBar('Album rejoint avec succès');
                this.fetchAlbums();
            })
            .catch((error) => {
                this.snackBarService.openSnackBar("Impossible de rejoindre l'album");
                this.fetchAlbums();
            });
    }

    async requestJoinPrivate(album: Album): Promise<void> {
        await this.httpService
            .post('/albums/requestToJoinPrivateAlbum', { albumID: album._id })
            .then(() => {
                this.snackBarService.openSnackBar("Requête d'accès envoyée avec succès");
            })
            .catch((error) => {
                this.snackBarService.openSnackBar("Impossible de rejoindre l'album");
                this.fetchAlbums();
            });
    }

    async view(album: Album): Promise<void> {
        this.router.navigate(['/album', album._id]);
    }

    async leave(album: Album, redirect: boolean = false): Promise<void> {
        this.albums = this.albums.filter((x) => x._id !== album._id);

        await this.httpService
            .post('/albums/removeUserFromAlbum', { albumID: album._id })
            .then(() => {
                this.snackBarService.openSnackBar('Album quitté avec succès');
                this.removeAlbum(album);
                this.fetchAlbums();
                if (redirect) this.router.navigate(['/albums']);
            })
            .catch((error) => {
                this.snackBarService.openSnackBar("Impossible de quitter l'album");
                this.fetchAlbums();
            });
    }

    async delete(album: Album, redirect: boolean = false): Promise<void> {
        this.albums = this.albums.filter((x) => x._id !== album._id);

        this.httpService
            .post('/albums/deleteAlbum', { albumID: album._id })
            .then(() => {
                this.snackBarService.openSnackBar('Album supprimé avec succès');

                this.fetchAlbums();
                if (redirect) this.router.navigate(['/albums']);
            })
            .catch((error) => {
                this.snackBarService.openSnackBar("Impossible de supprimer l'album");
                this.fetchAlbums();
            });
    }

    async getAllRequests(): Promise<void> {
        const tempRequests: Map<string, Request[]> = new Map();
        await Promise.all(
            this.joinedAlbums.map(async (album: Album) => {
                return this.httpService.get(`/albums/allUserRequestingToJoinAlbum/${album._id}`).then((result) => {
                    if (result.length === 0) return;
                    result.map(async (userId: string) => {
                        const name = await this.httpService.get(`/users/userInfo/${userId}`).then((res) => res.username);
                        const request = {
                            name,
                            userId,
                            albumId: album._id,
                        } as Request;
                        if (!tempRequests.has(album._id)) tempRequests.set(album._id, []);
                        tempRequests.get(album._id)?.push(request);
                    });
                });
            }),
        );
        this.requests = tempRequests;
    }

    numberOfRequests(album: Album): number {
        return this.requests.get(album._id)?.length ?? 0;
    }

    async acceptRequest(request: Request): Promise<void> {
        await this.httpService
            .post('/albums/allowUserToJoinPrivateAlbum', { albumID: request.albumId, userIDToAdd: request.userId })
            .then(() => {
                this.snackBarService.openSnackBar('Demande acceptée');
                this.getAllRequests();
                this.fetchAlbums();
            })
            .catch((error) => {
                this.snackBarService.openSnackBar("Impossible d'accepter la demande");
                this.getAllRequests();
                this.fetchAlbums();
            });
    }

    async declineRequest(request: Request): Promise<void> {
        await this.httpService
            .post('/albums/rejectUserToJoinPrivateAlbum', { albumID: request.albumId, userIDToReject: request.userId })
            .then(() => {
                this.snackBarService.openSnackBar('Demande refusée');
                this.getAllRequests();

                this.fetchAlbums();
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de refuser la demande');
                this.getAllRequests();

                this.fetchAlbums();
            });
    }

    edit(album?: Album): void {
        this.dialogService.openDialog(EditAlbumComponent, { album: album ?? this.getAlbumByPath() }).then(() => this.fetchAlbums());
    }
}
