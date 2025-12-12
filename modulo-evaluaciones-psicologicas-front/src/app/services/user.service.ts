import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDTO, CreateUserRequestDTO, UpdateUserRequestDTO, ChangePasswordRequestDTO } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.catalogBaseUrl}/usuarios`;

  list(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.base).pipe(map(list => list?.map(userMapper) ?? []));
  }

  find(username: string): Observable<UserDTO> {
    return this.http
      .get<UserDTO>(`${this.base}/${encodeURIComponent(username)}`)
      .pipe(map(userMapper));
  }

  create(payload: CreateUserRequestDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.base, payload).pipe(map(userMapper));
  }

  update(payload: UpdateUserRequestDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(this.base, payload).pipe(map(userMapper));
  }

  delete(username: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(username)}`);
  }

  changePassword(payload: ChangePasswordRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.base}/password`, payload);
  }
}

const userMapper = (dto: Partial<UserDTO> | null | undefined): UserDTO => {
  if (!dto) {
    return {
      username: '',
      email: '',
      roleId: undefined,
      roleName: undefined,
      active: true,
      roles: []
    };
  }
  const anyDto = dto as Record<string, unknown>;
  const role = anyDto['role'] as { id?: number; name?: string } | undefined;
  const rolesArray = Array.isArray(dto.roles) ? dto.roles : [];
  return {
    id: dto.id ?? (anyDto['id'] as number | undefined),
    username: dto.username ?? (anyDto['username'] as string) ?? '',
    email: dto.email ?? (anyDto['email'] as string | undefined) ?? '',
    roleId: dto.roleId ?? role?.id ?? (anyDto['roleId'] as number | undefined),
    roleName: dto.roleName ?? role?.name ?? (anyDto['roleName'] as string | undefined),
    active: dto.active ?? (anyDto['active'] as boolean | undefined)
      ?? (anyDto['enabled'] as boolean | undefined) ?? true,
    roles: rolesArray
  };
};
