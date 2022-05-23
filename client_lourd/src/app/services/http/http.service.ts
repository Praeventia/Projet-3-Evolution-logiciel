// tslint:disable: no-any
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HTTP_STATUS_NOT_ACCEPTABLE, HTTP_STATUS_UNAUTHORIZED } from '@app/const';
import { DialogService } from '@app/services/dialog/dialog.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { UserService } from '@app/services/user/user.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(
        private http: HttpClient,
        private userService: UserService,
        private router: Router,
        private snackBarService: SnackBarService,
        private dialogService: DialogService,
    ) {}

    async get(query: string, loginRequired: boolean = true): Promise<any> {
        if (loginRequired && !this.userService.userConnected) throw new Error('Vous devez être connecté pour effectuer cette action');

        return new Promise(async (resolve, reject) => {
            await this.http
                .get<any>(environment.SERVER_BASE + query)
                .toPromise()
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    this.catch(error, loginRequired);
                    reject(error);
                });
        });
    }

    async post(query: string, params: any, loginRequired: boolean = true): Promise<any> {
        if (loginRequired && !this.userService.userConnected) throw new Error('Vous devez être connecté pour effectuer cette action');

        return new Promise(async (resolve, reject) => {
            await this.http
                .post<any>(environment.SERVER_BASE + query, params)
                .toPromise()
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    this.catch(error, loginRequired);
                    reject(error);
                });
        });
    }

    async put(query: string, params: any, loginRequired: boolean = true): Promise<any> {
        if (loginRequired && !this.userService.userConnected) throw new Error('Vous devez être connecté pour effectuer cette action');

        return new Promise(async (resolve, reject) => {
            await this.http
                .put<any>(environment.SERVER_BASE + query, params)
                .toPromise()
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    this.catch(error, loginRequired);
                    reject(error);
                });
        });
    }

    catch(error: any, loginRequired: boolean): void {
        if (error.error.statusCode === HTTP_STATUS_UNAUTHORIZED && loginRequired) this.userService.disconnectUser();
        if (error.error.statusCode === HTTP_STATUS_NOT_ACCEPTABLE && error.error.message === "Cette album n'existe pas") {
            this.router.navigate(['/albums']);
            this.snackBarService.openSnackBar("Cet album n'existe plus");
            this.dialogService.closeAll();
        }
        if (error.error.statusCode === HTTP_STATUS_NOT_ACCEPTABLE && error.error.message === "Ce dessin n'existe pas") {
            this.router.navigate(['/home']);
            this.snackBarService.openSnackBar("Ce dessin n'existe plus");
        }
    }
}
