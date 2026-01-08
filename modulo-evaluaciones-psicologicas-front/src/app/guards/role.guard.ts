import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed: string[] = route.data['roles'] || [];
  if (!allowed || allowed.length === 0) return true;
  if (auth.hasAnyRole(allowed)) return true;
  const fallback = auth.hasRole('ROLE_PSICOLOGO')
    ? '/psicologo/personal'
    : auth.hasRole('ROLE_ADMINISTRADOR')
      ? '/admin/catalogos'
      : '/login';
  router.navigate([fallback]).catch(() => {});
  return false;
};
