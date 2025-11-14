import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { CourseDetailsComponent } from './features/course-details/course-details.component';
import { CoursesComponent } from './features/courses/courses.component';
import { HomeComponent } from './features/home/home.component';
import { InstructorDashboardComponent } from './features/instructor-dashboard/instructor-dashboard.component';
import { UsercoursesComponent } from './features/userprofile/usercourses/usercourses.component';
import { UserinformationComponent } from './features/userprofile/userinformation/userinformation.component';
import { UserprofileComponent } from './features/userprofile/userprofile.component';
import { ViewFullCourseComponent } from './features/view-full-course/view-full-course.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule, NavbarComponent,FooterComponent, SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'E-learning-final';

  showNavBar: boolean = true;
  showFooter: boolean = true;
  showSidebar: boolean = false;
  authService = inject(AuthService);

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const currentUrl = this.router.routerState.root.firstChild?.snapshot.url[0]?.path;
        this.showFooter = !(currentUrl === 'login' || currentUrl === 'signup' || currentUrl === 'instructor');
        this.showSidebar = !(currentUrl === 'instructor');
      });
  }

  toggleNavbar(show:boolean){
    this.showNavBar=show
  }
ngOnInit(): void {
  onAuthStateChanged(this.authService.user$, (user) => {
    if(user) {
      this.authService.currentUser.set({
        email: user.email!,
        username: user.displayName!,
        password: ''
      });
    } else {
      this.authService.currentUser.set(null);
    }
  });
  console.log(this.authService.currentUser());
}
}

export const routes: Routes = [
    { path: "home", component: HomeComponent },
    { path: "courses", component: CoursesComponent },
    { path: "course-details/:id", component: CourseDetailsComponent },
    { path: "", redirectTo: "home", pathMatch: 'full' },
    { path: "login", component: LoginComponent },
    { path: "signup", component: SignUpComponent },
    { path: "checkout/:id", component: CheckoutComponent },
    { path: "view-full-course/:id", component: ViewFullCourseComponent },

    {
        path: "instructor",
        component: InstructorDashboardComponent,
        children: [
            { path: 'create', component: InstructorDashboardComponent },
            { path: 'quizzes', component: InstructorDashboardComponent },
            { path: 'projects', component: InstructorDashboardComponent }
        ]
    },

    {
        path: "userprofile",
        component: UserprofileComponent,
        children: [
            { path: "personal-info", component: UserinformationComponent },
            { path: "mycourses", component: UsercoursesComponent }
        ]
    }
];
