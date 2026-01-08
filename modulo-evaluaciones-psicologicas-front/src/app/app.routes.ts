import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/catalogos', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
    children: [
      { path: '', loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent) },
      { path: 'new', loadComponent: () => import('./users/register/register.component').then(m => m.RegisterComponent) },
      {
        path: 'password-requests',
        loadComponent: () => import('./users/password-requests/password-requests.component').then(m => m.PasswordRequestsComponent)
      },
      { path: ':id/edit', loadComponent: () => import('./users/user-form/user-form.component').then(m => m.UserFormComponent) },
      { path: ':id/change-password', loadComponent: () => import('./users/change-password/change-password.component').then(m => m.ChangePasswordComponent) }
    ]
  },
  {
    path: 'psicologo',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_PSICOLOGO'] },
    children: [
      { path: '', redirectTo: 'personal', pathMatch: 'full' },
      { path: 'personal', loadComponent: () => import('./psicologo/personal-search/personal-search.component').then(m => m.PersonalSearchComponent) },
      { path: 'personal/nuevo', loadComponent: () => import('./psicologo/personal-detail/personal-detail.component').then(m => m.PersonalDetailComponent) },
      { path: 'personal/:personalId', loadComponent: () => import('./psicologo/personal-detail/personal-detail.component').then(m => m.PersonalDetailComponent) },
      { path: 'personal/:personalId/historial', loadComponent: () => import('./psicologo/personal-historial/personal-historial.component').then(m => m.PersonalHistorialComponent) },
      { path: 'fichas/nueva/:personalId', loadComponent: () => import('./psicologo/ficha-form/ficha-psicologica-form.component').then(m => m.FichaPsicologicaFormComponent) },
      { path: 'fichas/:fichaId/condicion-final', loadComponent: () => import('./psicologo/ficha-condicion/ficha-condicion-final.component').then(m => m.FichaCondicionFinalComponent) }
    ]
  },
  {
    path: 'reportes',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_PSICOLOGO'] },
    children: [
      { path: '', redirectTo: 'atenciones-psicologos', pathMatch: 'full' },
      { path: 'atenciones-psicologos', loadComponent: () => import('./reports/atenciones-psicologos/atenciones-psicologos-report.component').then(m => m.AtencionesPsicologosReportComponent) }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: '**', redirectTo: 'admin/catalogos' }
];
