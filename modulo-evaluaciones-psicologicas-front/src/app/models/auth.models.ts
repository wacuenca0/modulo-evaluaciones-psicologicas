// Authentication and Authorization DTO models adapted to spec v1.0 (2025-11-24)

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface UserDTO {
  id?: number;
  username: string;
  email?: string;
  roleId?: number;
  roleName?: string;
  active?: boolean;
  roles?: string[];
}

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // seconds
  user: UserDTO;
  refreshToken?: string;
}

export interface CreateUserRequestDTO {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequestDTO {
  id: number;
  username: string;
  email: string;
  roleId: number;
  active: boolean;
  password?: string;
}

export interface ChangePasswordRequestDTO {
  username: string;
  password: string;
}

export interface RoleDTO {
  id: number;
  name: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface ErrorResponseDTO {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
