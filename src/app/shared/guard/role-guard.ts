import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Auth } from '../services/auth';
import { Observable } from 'rxjs';

export const roleGuard: (requiredGroups: string[]) => CanActivateFn =
    (requiredGroups: string[]) => {

    return (
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {

        const authService = inject(Auth);
        const router = inject(Router);

        // 1. Authentication check
        if (!authService.getAccessToken()) {
            console.warn('Access denied: Authentication credentials not provided.');
            return router.createUrlTree(['/account/login']);
        }

        // 2. Authorization check
        const isAuthorized = requiredGroups.some(group =>
            authService.userInGroup(group)
        );

        if (isAuthorized) {
            return true;
        } else {
            console.warn(`Access Denied. Required groups: ${requiredGroups.join(', ')}`);
            return router.createUrlTree(['/access-denied']);
        }
    };
};
