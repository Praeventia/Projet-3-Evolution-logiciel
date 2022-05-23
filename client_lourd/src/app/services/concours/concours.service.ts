import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExpositionComponent } from '@app/components/album/exposition/exposition.component';
import { MAX_LIKES_PER_WEEK } from '@app/const';
import { Drawing } from '@app/services/album/album.service';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
import { environment } from 'src/environments/environment';

export interface Concours {
    startDate: Date;
    endDate: Date;
    theme: string;
    _id: string;
    winners: Entry[];
}

export interface Entry {
    drawingName: string;
    ownerID: string;
    isOwner: boolean;
    ownerName: string;
    _id: string;
    hasAlreadyUpVoted: boolean;
    hasAlreadyDownVoted: boolean;
    concoursWeekID: string;
    creationDate: Date;
    vote: number;
    url: SafeResourceUrl;
}
@Injectable({
    providedIn: 'root',
})
export class ConcoursService {
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private snackBarService: SnackBarService,
        private dialogService: DialogService,
    ) {}

    concoursIsLoading: boolean = false;

    canPublishToConcours: boolean = false;

    numberOfLikesLeft: number = 0;
    currentConcours: Concours;
    pastConcours: Concours[];

    entries: Entry[] = [];

    async init(silent: boolean): Promise<void> {
        if (this.concoursIsLoading) return;
        this.concoursIsLoading = !silent || this.entries.length === 0;
        this.userService
            .waitForConnexion()
            .then(async () => {
                await this.update();
            })
            .finally(() => {
                this.concoursIsLoading = false;
            });
    }

    async update(): Promise<void> {
        await this.fetchEntries();
        await Promise.all([this.getcurrentConcours(), this.getPastConcours()]);
        this.canPublishToConcours = await this.httpService.get('/concours/userCanStillPublishEntry');
        this.numberOfLikesLeft = MAX_LIKES_PER_WEEK - (await this.httpService.get('/concours/numberOfUpVoteThisWeekByUser'));
    }

    async getcurrentConcours(): Promise<void> {
        await this.httpService.get('/concours/topEntryCurrentConcours').then((result) => {
            this.currentConcours = {
                ...result.concoursWeek,
                winners: result.winner.map((winner: any) => {
                    return this.entries.find((entry: Entry) => entry._id === winner._id);
                }),
            };
        });
    }

    async getPastConcours(): Promise<void> {
        await this.httpService.get('/concours/topEntryPastConcours').then((result) => {
            this.pastConcours = result.map((concours: any) => {
                return {
                    ...concours.concoursWeek,
                    winners: concours.winner,
                };
            });
        });
        await Promise.all(
            this.pastConcours.map(async (concours: Concours) => {
                return concours.winners.map(async (winner: Entry) => {
                    this.getImage(winner).then(async (url: SafeResourceUrl) => {
                        winner.url = url;
                    });
                });
            }),
        ).then(() => {
            this.pastConcours.sort((a: Concours, b: Concours) => {
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            });
        });
    }

    pastConcoursWithWinners(): Concours[] {
        return this.pastConcours?.filter((concours: Concours) => concours.winners.length > 0);
    }

    async fetchEntries(): Promise<void> {
        const entries: Entry[] = [];
        await this.httpService.get('/concours/allEntryCurrentConcours').then((result) => {
            entries.push(...result);
        });

        await Promise.all(
            entries.map(async (entry: Entry) => {
                return this.getImage(entry).then(async (url: SafeResourceUrl) => {
                    entry.url = url;
                });
            }),
        );

        await Promise.all(
            entries.map(async (entry: Entry) => {
                return this.httpService.get('/users/userInfo/' + entry.ownerID).then((res) => {
                    entry.ownerName = res.username;
                });
            }),
        );

        entries.map(async (entry: Entry) => {
            entry.isOwner = entry.ownerID === this.userService.user?._id;
        });
        this.entries = entries;
    }

    async getImage(entry: Entry): Promise<SafeResourceUrl> {
        return await new Promise(async (resolve) => {
            const url = environment.SERVER_BASE + '/concours/picture/' + entry._id;
            const image = await this.http.get(url, { responseType: 'blob' }).toPromise();
            const base64 = await this.convertBlobToBase64(image);
            const sanitizedImage = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
            resolve(sanitizedImage);
        });
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

    async view(entry: Entry): Promise<void> {
        this.dialogService.openDialog(ExpositionComponent, { url: entry.url });
    }

    async upvote(entry: Entry): Promise<void> {
        await this.httpService
            .post('/concours/upvoteForEntry', { id: entry._id })
            .then((result) => {
                entry.hasAlreadyUpVoted = true;
                entry.vote++;

                if (entry.hasAlreadyDownVoted) {
                    entry.vote++;
                    entry.hasAlreadyDownVoted = false;
                } else {
                    this.numberOfLikesLeft--;
                }
            })
            .catch(() => {
                this.snackBarService.openSnackBar('impossible de voter pour cette entrée');
                this.update();
            });
    }

    async unupvote(entry: Entry): Promise<void> {
        await this.httpService
            .post('/concours/unupvoteForEntry', { id: entry._id })
            .then((result) => {
                entry.hasAlreadyUpVoted = false;
                entry.vote--;
                this.numberOfLikesLeft++;
            })
            .catch(() => {
                this.snackBarService.openSnackBar('impossible de voter pour cette entrée');
                this.update();
            });
    }

    async downvote(entry: Entry): Promise<void> {
        await this.httpService
            .post('/concours/downvoteForEntry', { id: entry._id })
            .then((result) => {
                entry.hasAlreadyDownVoted = true;
                entry.vote--;
                if (entry.hasAlreadyUpVoted) {
                    entry.vote--;
                    entry.hasAlreadyUpVoted = false;
                } else {
                    this.numberOfLikesLeft--;
                }
            })
            .catch(() => {
                this.snackBarService.openSnackBar('impossible de voter pour cette entrée');
                this.update();
            });
    }

    async undownvote(entry: Entry): Promise<void> {
        await this.httpService
            .post('/concours/undownvoteForEntry', { id: entry._id })
            .then((result) => {
                entry.hasAlreadyDownVoted = false;
                entry.vote++;
                this.numberOfLikesLeft++;
            })
            .catch(() => {
                this.snackBarService.openSnackBar('impossible de voter pour cette entrée');
                this.update();
            });
    }

    async upload(event: Event, drawing: Drawing): Promise<void> {
        event.preventDefault();
        event.stopPropagation();

        await this.httpService.put('/concours/uploadConcoursEntry?drawingID=' + drawing._id, {}).then((result) => {
            this.snackBarService.openSnackBar('Votre dessin a bien été ajouté au concours');
            this.entries.push(result);
            this.update();
            this.canPublishToConcours = false;
        });
    }

    async toggleUpVote(event: Event, entry: Entry): Promise<void> {
        event.stopPropagation();
        entry.hasAlreadyUpVoted ? await this.unupvote(entry) : await this.upvote(entry);
    }

    async toggleDownVote(event: Event, entry: Entry): Promise<void> {
        event.stopPropagation();
        entry.hasAlreadyDownVoted ? await this.undownvote(entry) : await this.downvote(entry);
    }

    getEntries(isSubmissionPage: boolean): Entry[] {
        return isSubmissionPage ? this.entries.filter((entry: Entry) => entry.isOwner) : this.entries;
    }

    delete(event: Event, entry: Entry): void {
        event.stopPropagation();

        this.httpService.post('/concours/deleteConcoursEntry', { id: entry._id }).then(() => {
            this.snackBarService.openSnackBar('Votre dessin a bien été supprimé du concours');
            this.update();
        });
    }
}
