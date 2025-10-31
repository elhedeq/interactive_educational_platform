import { Component, inject } from '@angular/core';
import { FormBuilder,ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, Routes } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CourseDetailsComponent } from '../../features/course-details/course-details.component';
import { CoursesComponent } from '../../features/courses/courses.component';
import { HomeComponent } from '../../features/home/home.component';
import { InstructorDashboardComponent } from '../../features/instructor-dashboard/instructor-dashboard.component';
import { SignUpComponent } from '../sign-up/sign-up.component';

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

export const routes: Routes = [
    { path: "home", component: HomeComponent },
    { path: "courses", component: CoursesComponent },
    { path: 'course-details/:id', component: CourseDetailsComponent },
    { path: "", redirectTo: "home", pathMatch: 'full' },
    { path: "login", component: LoginComponent },
    { path: "signup", component: SignUpComponent },
    {
        path: "instructor",
        component: InstructorDashboardComponent,
        children: [
            { path: '', component: InstructorDashboardComponent },
            { path: 'create', component: InstructorDashboardComponent },
            { path: 'quizzes', component: InstructorDashboardComponent },
            { path: 'projects', component: InstructorDashboardComponent }
        ]
    },
];
