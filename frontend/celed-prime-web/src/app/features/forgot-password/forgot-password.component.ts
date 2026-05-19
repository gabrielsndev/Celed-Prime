import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'cp-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  step: 1 | 2 = 1;
  loading = false;
  errorMessage = '';
  successMessage = '';

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  solicitarCodigo() {
    if (this.emailForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    
    const email = this.emailForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao solicitar recuperação.';
      }
    });
  }

  redefinirSenha() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const payload = this.resetForm.value;

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Senha alterada com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Código inválido ou expirado.';
      }
    });
  }
}