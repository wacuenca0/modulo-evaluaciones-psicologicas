import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AppNavComponent } from '../../general/nav/app-nav.component';
import { UsersTabsComponent } from '../users-tabs.component';
import { RoleService } from '../../services/role.service';
import { UpdateUserRequestDTO, CreateUserRequestDTO, RoleDTO, UserDTO } from '../../models/auth.models';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  imports: [CommonModule, ReactiveFormsModule, AppNavComponent, UsersTabsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent  {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly roles = signal<RoleDTO[]>([]);
  readonly isEdit = signal(false);
  readonly userId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''], // optional when editing
    roleId: [null, Validators.required],
    active: [true]
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.load(id);
    }
    this.roleService.list().subscribe(list => this.roles.set(list));
  }

  load(username: string) {
    this.userService.find(username).subscribe((u: UserDTO) => {
      this.userId.set(u.id ?? null);
      this.form.patchValue({
        username: u.username,
        email: u.email,
        roleId: u.roleId ?? null,
        active: u.active ?? true
      });
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const value = this.form.getRawValue() as {
      username: string;
      email: string;
      password: string;
      roleId: number | null;
      active: boolean;
    };
    if (this.isEdit()) {
      const id = this.userId();
      if (id == null) {
        this.loading.set(false);
        return;
      }
      const roleId = value.roleId;
      if (roleId == null) {
        this.loading.set(false);
        return;
      }
      const payload: UpdateUserRequestDTO = {
        id,
        username: value.username,
        email: value.email,
        roleId,
        active: !!value.active,
        ...(value.password ? { password: value.password } : {})
      };
      this.userService.update(payload).subscribe({
        next: () => { this.loading.set(false); this.router.navigate(['/users']); },
        error: () => this.loading.set(false)
      });
    } else {
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
        error: () => this.loading.set(false)
      });
    }
  }
}
