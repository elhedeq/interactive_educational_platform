import { Routes } from '@angular/router';
import { FooterComponent } from './core/footer/footer.component';
import { CoursesComponent } from './features/courses/courses.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { Sign } from 'crypto';

export const routes: Routes = [
   {path:"home" ,component:HomeComponent },
    {path:"courses" ,component:CoursesComponent},
    {path:"" ,redirectTo:"home" ,pathMatch:'full'},
    {path:"login" ,component:LoginComponent},
    {path:"signup" ,component:SignUpComponent},
];
