import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AppNavComponent } from '../../general/nav/app-nav.component';
import { UsersTabsComponent } from '../users-tabs.component';
import { UserDTO } from '../../models/auth.models';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  imports: [CommonModule, RouterModule, AppNavComponent, UsersTabsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent  {
  private readonly userService = inject(UserService);
  readonly users = signal<UserDTO[]>([]);
  readonly loading = signal(false);

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
