import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '@app/services/user/user.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// tslint:disable: no-any
@Injectable()
export class Interceptor implements HttpInterceptor {
    constructor(public userService: UserService) {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const accessToken = localStorage.getItem(environment.ACCESS_TOKEN);

        if (!accessToken) return next.handle(req);

        const modifiedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
        });
        return next.handle(modifiedReq);
    }
}
