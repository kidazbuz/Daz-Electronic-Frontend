import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const completedGuard: CanActivateFn = (route, state) => {

  const authService = inject(Auth);
  const router = inject(Router);

  const user = authService.getAuthenticatedUser();

  // if (user && !!user.is_profile_complete && !user.is_default_password) {
  //
  //   router.navigate(['/access-denied']);
  //
  //   return false;
  // }

  if (user && !user.is_profile_complete) {

    router.navigate(['/account/profile/complete-registration']);

  }


  else if (user && user.is_default_password) {

    router.navigate(['/account/profile/change-password']);

  }

  else if (user && !user.is_default_password && user.is_profile_complete) {

    router.navigate(['/dashboard/main']);

  }

  else {
    router.navigate(['/access-denied']);
  }

  return true;
  
};
