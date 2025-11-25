import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { CoursesComponent } from './features/courses/courses.component';
import { CourseDetailsComponent } from './features/course-details/course-details.component';

import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';

import { CheckoutComponent } from './features/checkout/checkout.component';
import { ViewFullCourseComponent } from './features/view-full-course/view-full-course.component';

import { InstructorDashboardComponent } from './features/instructor-dashboard/instructor-dashboard.component';
import { InstructorCoursesComponent } from './features/instructor-dashboard/instructor-courses/instructor-courses.component';
import { CreateCourseComponent } from './features/instructor-dashboard/create-course/create-course.component';

import { UserprofileComponent } from './features/userprofile/userprofile.component';
import { UserinformationComponent } from './features/userprofile/userinformation/userinformation.component';
import { UsercoursesComponent } from './features/userprofile/usercourses/usercourses.component';

import { AuthGuard } from './guards/auth.guard';
import { GradeQuizzesComponent } from './features/instructor-dashboard/grade-quizzes/grade-quizzes.component';
import { GradeProjectsComponent } from './features/instructor-dashboard/grade-projects/grade-projects.component';
import { OverviewComponent } from './features/admin-dashboard/overview/overview.component';
import { AccountsComponent } from './features/admin-dashboard/accounts/accounts.component';
import { SubscriptionsComponent } from './features/admin-dashboard/subscriptions/subscriptions.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  { path: "home", component: HomeComponent },
  { path: "courses", component: CoursesComponent },
  { path: "course-details/:id", component: CourseDetailsComponent },

  { path: "login", component: LoginComponent },
  { path: "signup", component: SignUpComponent },

  { path: "checkout/:id", component: CheckoutComponent, canActivate: [AuthGuard] },

  { path: "view-full-course/:id", component: ViewFullCourseComponent, canActivate: [AuthGuard] },

  {
    path: "admin",
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {path: "", component: OverviewComponent, pathMatch: "full"},
      { path: "accounts", component: AccountsComponent },
      { path: "create", component: CreateCourseComponent },
      { path: "create/:id", component: CreateCourseComponent },
      { path: "subscriptions", component: SubscriptionsComponent }
    ]
  },
  {
    path: "instructor",
    component: InstructorDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {path: "", component: InstructorCoursesComponent, pathMatch: "full"},
      { path: "course", component: CreateCourseComponent },
      { path: "course/:id", component: CreateCourseComponent },
      { path: "quizzes/:id", component: GradeQuizzesComponent },
      { path: "project/:id", component: GradeProjectsComponent }
    ]
  },

  {
    path: "userprofile",
    component: UserprofileComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "personal-info", component: UserinformationComponent },
      { path: "mycourses", component: UsercoursesComponent }
    ]
  },

  // Catch-all route - redirect unmatched routes to home
  { path: "**", redirectTo: "home", pathMatch: "full" }
];
