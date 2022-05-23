import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class ReturnService {
    private lastValidPath: string = '/home';
    private prevPath: string = '/home';
    private returnExceptions: Set<string> = new Set<string>(['/profile', '/signin', '/signup', '/settings']);

    constructor(private router: Router) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.changeRoute(event.url);
            }
        });
    }

    changeRoute(path: string): void {
        if (this.returnExceptions.has(path)) return;
        this.prevPath = this.lastValidPath;
        this.lastValidPath = path;
    }

    return(): void {
        this.router.navigate([this.lastValidPath]);
    }

    back(): void {
        this.router.navigate([this.prevPath]);
    }
}
