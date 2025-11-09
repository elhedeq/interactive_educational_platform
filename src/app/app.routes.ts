import { Routes } from '@angular/router';
import { FooterComponent } from './core/footer/footer.component';
import { CoursesComponent } from './features/courses/courses.component';
import { CourseDetailsComponent } from './features/course-details/course-details.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { Sign } from 'crypto';
import { InstructorDashboardComponent } from './features/instructor-dashboard/instructor-dashboard.component';
import { checkoutComponent } from './features/checkout/checkout.component';

export const routes: Routes = [
   {path:"home" ,component:HomeComponent },
    {path:"courses" ,component:CoursesComponent},
    { path: 'course-details/:id', component:CourseDetailsComponent },
    {path:"" ,redirectTo:"home" ,pathMatch:'full'},
    {path:"login" ,component:LoginComponent},
    {path:"signup" ,component:SignUpComponent},
    {path:"checkout",component:checkoutComponent},
    {
        path:"instructor",
        component: InstructorDashboardComponent,
        children: [
            { path: '', component: InstructorDashboardComponent },
            { path: 'create', component: InstructorDashboardComponent },
            { path: 'quizzes', component: InstructorDashboardComponent },
            { path: 'projects', component: InstructorDashboardComponent }
        ]
    },
];
