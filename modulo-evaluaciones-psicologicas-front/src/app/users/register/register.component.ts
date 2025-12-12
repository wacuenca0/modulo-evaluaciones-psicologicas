import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { AppNavComponent } from '../../general/nav/app-nav.component';
import { UsersTabsComponent } from '../users-tabs.component';
import { CreateUserRequestDTO, RoleDTO } from '../../models/auth.models';

type RegisterFormValue = {
  username: string;
  email: string;
  password: string;
  roleId: number | null;
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppNavComponent, UsersTabsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly roles = signal<RoleDTO[]>([]);
  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleId: [null, Validators.required]
  });

  constructor() { this.roleService.list().subscribe(list => this.roles.set(list)); }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const value = this.form.getRawValue() as RegisterFormValue;
    const roleId = value.roleId;
    if (roleId == null) {
      this.loading.set(false);
      return;
    }
    const payload: CreateUserRequestDTO = {
      username: value.username,
      email: value.email,
      password: value.password,
      roleId
    };
    this.userService.create(payload).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/users']); },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.message || 'Error al crear usuario'); }
    });
  }
}
