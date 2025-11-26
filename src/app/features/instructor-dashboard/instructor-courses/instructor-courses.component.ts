import { Component, inject, OnInit } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { AuthRoutingModule } from "../../../auth/auth-routing.module";
import { Notification } from '../../../services/notifications.service';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [NgForOf, AuthRoutingModule, NgIf],
  templateUrl: './instructor-courses.component.html',
  styleUrl: './instructor-courses.component.css'
})
export class InstructorCoursesComponent implements OnInit{
  http = inject(HttpClient);
  notification = inject(Notification);
  authService = inject(AuthService);
  notificaion = inject(Notification);
  courses:{id:number,name:string,description:string,thumbnail:string,price:number,author:number,category:string,instructor_first_name:string,instructor_last_name:string, subscriptions:any[]}[] = [];

  ngOnInit(): void {
    this.http.get<any>(`http://localhost/backend/api.php/users/${this.authService.getId()}/created-courses`)
    .subscribe({
      next: response => {
        this.courses = response;
        for(let course of this.courses) {
          this.http.get<any>(`http://localhost/backend/api.php/courses/${course.id}/subscriptions`)
          .subscribe({
            next: response => {
              course.subscriptions = response;
            },
            error: err => {
              this.notification.showNotification('somthing went wrong',1000,'danger');
              console.error(`Error fetching course ${course.name} subscriptions:`,err);
            }
          });
        }
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('Error fetching instructor courses: ',err);
      }
    });
  }

  deleteCourse(id:number) {
    this.http.delete(`http://localhost/backend/api.php/courses/${id}`)
    .subscribe({
      next: response => {
        this.notificaion.showNotification('course deleted', 1000, 'success');
        this.ngOnInit();
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('Error deleting course:', err);
      }
    });
  }

  noCourses() {
    return this.courses.length === 0;
  }

  getTotalSubs(index:number) {
    if(this.courses[index] && this.courses[index]?.subscriptions){
      return this.courses[index]?.subscriptions.length;
    }
    return 0;
  }

  getCompletionRate(index:any) {
    let progress = 0;
    if(this.courses[index] && this.courses[index]?.subscriptions){
      for (const sub of this.courses[index].subscriptions) {
        progress += parseInt(sub.progress);
      }
      progress /= this.courses[index].subscriptions.length;
      return Math.floor(progress);
    }
    return 0;
  }

}
