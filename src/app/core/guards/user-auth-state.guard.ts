import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../../services/common/user.service';
import { environment } from '../../../environments/environment';

export const userAuthStateGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (userService.getUserStatus()) {
    router.navigate([environment.userBaseUrl]);
    return false;
  }

  return true;
};
