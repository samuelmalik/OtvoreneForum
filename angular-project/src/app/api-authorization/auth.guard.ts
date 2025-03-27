import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.authenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.role() == "admin") {
    return true;
  }
  console.log("neopravneny vstup")
  alert('Táto stránka je prístupná len adminom')
  router.navigate(['']);
  return false;
};
