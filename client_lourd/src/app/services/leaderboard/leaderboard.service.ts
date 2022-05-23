import { Injectable } from '@angular/core';
import { AvatarService } from '@app/services/avatar/avatar.service';
import { HttpService } from '@app/services/http/http.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';

const SECONDS = 60;

export interface Leaderboard {
    leaderboardName: string;
    winners: LeaderboardWinner[];
}

export interface LeaderboardWinner {
    username: string;
    _id: string;
    score: any;
    url: string;
}
// tslint:disable
@Injectable({
    providedIn: 'root',
})
export class LeaderboardService {
    leaderboardIsLoading: boolean = false;
    leaderboards: Leaderboard[];
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        private snackBarService: SnackBarService,
        private avatarService: AvatarService,
    ) {
        this.init();
    }

    formatSecondsToTime(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / (SECONDS * SECONDS));
        const minuteDivider = totalSeconds % (SECONDS * SECONDS);
        const minutes = Math.floor(minuteDivider / SECONDS);
        const secondsDivider = minuteDivider % SECONDS;
        const seconds = Math.ceil(secondsDivider);

        return (
            hours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            'h' +
            minutes.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            'm' +
            seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) +
            's'
        );
    }

    async init(): Promise<void> {
        this.userService.userConnected
            ? await this.update()
            : this.userService.notifyWhenUserConnected().subscribe(async () => {
                  await this.update();
              });
    }

    async update(): Promise<void> {
        this.leaderboardIsLoading = true;
        this.leaderboards = await Promise.all([
            this.mostAlbumJoin(),
            this.mostMessageSent(),
            this.mostRoomJoin(),
            this.mostDrawingContributed(),
            this.mostTotalEditionTime(),
            this.mostAverageCollaborationTime(),
            this.mostPixelCross(),
            this.mostLineCount(),
            this.mostShapeCount(),
            this.mostOldLogin(),
            this.mostRecentLogin(),
            this.mostLogin(),
            this.mostDisconnect(),
            this.mostConcoursEntry(),
            this.mostVote(),
        ]);

        this.leaderboardIsLoading = false;
    }

    async mostMessageSent(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostMessageSent')
            .then((result) => {
                return {
                    leaderboardName: 'plus de messages envoyés',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.numberOfMessageSent,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de messages envoyés');
                return {} as Leaderboard;
            });
    }

    async mostTotalEditionTime(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostTotalEditionTime')
            .then((result) => {
                return {
                    leaderboardName: "plus de temps total d'édition",
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: this.formatSecondsToTime(winner.totalEditionTime),
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar("Impossible de charger le leaderboard de plus de temps total d'édition");
                return {} as Leaderboard;
            });
    }

    async mostPixelCross(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostPixelCross')
            .then((result) => {
                return {
                    leaderboardName: 'plus de pixels dessinés',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.pixelCross,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de pixels dessinés');
                return {} as Leaderboard;
            });
    }

    async mostLineCount(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostLineCount')
            .then((result) => {
                return {
                    leaderboardName: 'plus de lignes dessinées',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.lineCount,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de lignes dessinées');
                return {} as Leaderboard;
            });
    }

    async mostShapeCount(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostShapeCount')
            .then((result) => {
                return {
                    leaderboardName: 'plus de formes dessinées',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.shapeCount,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de formes dessinées');
                return {} as Leaderboard;
            });
    }
    async mostRecentLogin(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostRecentLogin')
            .then((result) => {
                return {
                    leaderboardName: 'plus récent connecté',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus récent connecté');
                return {} as Leaderboard;
            });
    }

    async mostOldLogin(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostOldLogin')
            .then((result) => {
                return {
                    leaderboardName: 'plus ancien connecté',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus ancien connecté');
                return {} as Leaderboard;
            });
    }

    async mostLogin(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostLogin')
            .then((result) => {
                return {
                    leaderboardName: 'plus de connexions',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.loginTime,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de connexions');
                return {} as Leaderboard;
            });
    }

    async mostDisconnect(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostDisconnect')
            .then((result) => {
                return {
                    leaderboardName: 'plus de déconnexions',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.disconnectTime,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de déconnexions');
                return {} as Leaderboard;
            });
    }

    async mostAverageCollaborationTime(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostAverageCollaborationTime')
            .then((result) => {
                return {
                    leaderboardName: 'plus de temps de collaboration',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: this.formatSecondsToTime(winner.averageTime),
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus moyen de temps de collaboration');
                return {} as Leaderboard;
            });
    }

    async mostRoomJoin(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostRoomJoin')
            .then((result) => {
                return {
                    leaderboardName: 'plus de canaux joint',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.roomJoined,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de canaux joint');
                return {} as Leaderboard;
            });
    }

    async mostAlbumJoin(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostAlbumJoin')
            .then((result) => {
                return {
                    leaderboardName: "plus d'albums joint",
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.albumJoined,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de album joint');
                return {} as Leaderboard;
            });
    }

    async mostDrawingContributed(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostDrawingContributed')
            .then((result) => {
                return {
                    leaderboardName: 'plus de dessins contribués',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.drawingContributed,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de dessin contribué');
                return {} as Leaderboard;
            });
    }

    async mostVote(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostVote')
            .then((result) => {
                return {
                    leaderboardName: 'plus de votes',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.vote,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de vote');
                return {} as Leaderboard;
            });
    }

    async mostConcoursEntry(): Promise<Leaderboard> {
        return await this.httpService
            .get('/leaderboard/mostConcoursEntry')
            .then((result) => {
                return {
                    leaderboardName: 'plus de participations au concours',
                    winners: result.map((winner: any) => {
                        return {
                            username: winner.username,
                            _id: winner._id,
                            score: winner.concoursEntry,
                            url: this.avatarService.userAvatarURL + winner.username,
                        } as LeaderboardWinner;
                    }),
                } as Leaderboard;
            })
            .catch((error) => {
                this.snackBarService.openSnackBar('Impossible de charger le leaderboard de plus de participation au concours');
                return {} as Leaderboard;
            });
    }
    // tslint:disable-next-line: max-file-line-count
}
