import { Component, inject } from '@angular/core';
import { FormBuilder,ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  fb = inject(FormBuilder)
  http = inject(HttpClient)
  authService = inject(AuthService);
  errorMessage: string | null = null;
  
  gotoSignup(){
    this.router.navigate(['/signup']);
  }
  
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    const formData = this.loginForm.getRawValue();
    this.authService.login(formData.email, formData.password)
    .subscribe({
      next: () => {
      this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.code;
      }
    });
  }
}
