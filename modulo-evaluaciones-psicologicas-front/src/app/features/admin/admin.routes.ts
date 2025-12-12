import { Routes } from '@angular/router';
import { RoleGuard } from '../../guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'panel', pathMatch: 'full' },
  {
    path: 'panel',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'personal',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./personal/personal-gestion.component').then(m => m.PersonalGestionComponent)
  },
  {
    path: 'psicologos',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./psicologos/psicologos-gestion.component').then(m => m.PsicologosGestionComponent)
  },
  {
    path: 'asignaciones',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./asignaciones').then(m => m.AsignacionesAdminComponent)
  },
  {
    path: 'asignaciones/mias',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_PSICOLOGO', 'ROLE_ADMIN'] },
    loadComponent: () => import('./asignaciones').then(m => m.MisAsignacionesComponent)
  },
  {
    path: 'fichas',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./fichas/fichas-gestion.component').then(m => m.FichasGestionComponent)
  },
  {
    path: 'seguimientos',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./seguimientos').then(m => m.SeguimientosGestionComponent)
  },
  {
    path: 'seguimientos/mios',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_PSICOLOGO', 'ROLE_ADMIN'] },
    loadComponent: () => import('./seguimientos').then(m => m.MisSeguimientosComponent)
  },
  {
    path: 'catalogos',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./catalogos/catalogos-admin.component').then(m => m.CatalogosAdminComponent)
  }
];
