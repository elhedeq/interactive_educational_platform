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

  fb = inject(FormBuilder)
  http = inject(HttpClient)
  authService = inject(AuthService);
  errorMessage: string | null = null;

  signupForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  gotoLogin(){
    this.router.navigate(['/login']);
  }

  onSubmit() {
    const formData = this.signupForm.getRawValue();
    this.authService.register(formData.email, formData.username, formData.password)
    .subscribe({
      next: () => {
      this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.code;
        console.log(err);
      }
    });
  }

}
