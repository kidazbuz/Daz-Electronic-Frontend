import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Auth } from '../services/auth';

export const authenticityGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(Auth);
  const router = inject(Router);

  const loginPath = '/account/login';
  const deniedPath = '/access-denied';


  if (!authService.getAccessToken()) {

    return router.createUrlTree([loginPath], { queryParams: { returnUrl: state.url } });
  }

  const allowedRoles = route.data?.['allowedRoles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = allowedRoles.some(role => authService.userInGroup(role));

  if (hasRequiredRole) {
    return true;
  }

  console.warn(`User lacks required roles: ${allowedRoles.join(', ')}`);
  return router.createUrlTree([deniedPath]);
};
