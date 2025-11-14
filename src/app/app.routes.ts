import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { CoursesComponent } from './features/courses/courses.component';
import { CourseDetailsComponent } from './features/course-details/course-details.component';

import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';

import { CheckoutComponent } from './features/checkout/checkout.component';
import { ViewFullCourseComponent } from './features/view-full-course/view-full-course.component';

import { InstructorDashboardComponent } from './features/instructor-dashboard/instructor-dashboard.component';

import { UserprofileComponent } from './features/userprofile/userprofile.component';
import { UserinformationComponent } from './features/userprofile/userinformation/userinformation.component';
import { UsercoursesComponent } from './features/userprofile/usercourses/usercourses.component';

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  { path: "home", component: HomeComponent },
  { path: "courses", component: CoursesComponent },
  { path: "course-details/:id", component: CourseDetailsComponent },

  { path: "login", component: LoginComponent },
  { path: "signup", component: SignUpComponent },

  { path: "checkout/:id", component: CheckoutComponent },

  // 🔥 important: standalone component → use component: ViewFullCourseComponent
  { path: "view-full-course/:id", component: ViewFullCourseComponent },

  {
    path: "instructor",
    component: InstructorDashboardComponent,
    children: [
      { path: "create", component: InstructorDashboardComponent },
      { path: "quizzes", component: InstructorDashboardComponent },
      { path: "projects", component: InstructorDashboardComponent }
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