import { Routes } from '@angular/router';
import { FooterComponent } from './core/footer/footer.component';
import { CoursesComponent } from './features/courses/courses.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
   {path:"home" ,component:HomeComponent },
    {path:"courses" ,component:CoursesComponent},
    {path:"" ,redirectTo:"home" ,pathMatch:'full'}
];
