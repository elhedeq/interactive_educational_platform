import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder,ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  constructor(private router: Router) {}

  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  errorMessage: string | null = null;

  signupForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  gotoLogin(){
    this.router.navigate(['/login']);
  }

  onSubmit() {
    const formData = this.signupForm.getRawValue();
    this.http.post('http://localhost/backend/api.php/users', {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password
    }).subscribe({
      next:(response: any) => {
      localStorage.setItem('token', response.token);
      this.authService.currentUser.set(response.user);
      this.router.navigate(['/home']);
    },
      error: (err) => {
        console.error('Sign-up error:', err);
        this.errorMessage = 'Error during sign-up. Please try again.';
      }
    });
  }

}
