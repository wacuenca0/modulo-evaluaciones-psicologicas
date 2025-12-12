import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequestDTO, LoginResponseDTO } from '../models/auth.models';

const REMEMBER_KEY = 'remembered_username';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})

export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal<string | null>(null);
  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false]
  });

  ngOnInit(): void {
    const storage = this.getLocalStorage();
    if (!storage) return;
    const saved = storage.getItem(REMEMBER_KEY);
    if (saved) this.form.patchValue({ username: saved, remember: true });
  }

  togglePassword() { this.showPassword.update(v => !v); }

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const dto: LoginRequestDTO = this.form.value as LoginRequestDTO;
    this.auth.login(dto).subscribe({
      next: (res: LoginResponseDTO) => {
        this.loading.set(false);
        this.error.set(null);
        // Persistencia de usuario recordado
        const storage = this.getLocalStorage();
        if (storage) {
          if (this.form.get('remember')?.value) {
            storage.setItem(REMEMBER_KEY, this.form.get('username')?.value || '');
          } else {
            storage.removeItem(REMEMBER_KEY);
          }
        }
        // Navigate always to dashboard on success
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.auth.clearAllTokens();
        if (err?.status === 403) this.error.set('Acceso denegado.');
        else if (err?.status === 401) this.error.set('Credenciales inválidas.');
        else this.error.set(err?.error?.message || 'No se pudo iniciar sesión.');
      }
    });
  }

  private getLocalStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }
}
