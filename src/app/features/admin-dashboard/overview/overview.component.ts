import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Notification } from '../../../services/notifications.service';
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [NgFor],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  http = inject(HttpClient);
  notification = inject(Notification);
  users:any[]=[];
  courses:any[]=[];
  subs:any[]=[];
  submissions:any[]=[];
  categories: Set<string>=new Set<string>();

  ngOnInit(): void {
    this.http.get<any>('http://localhost/backend/api.php/users')
    .subscribe({
      next: response => {
        this.users = response;
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error fetching users: ',err);
      }
    });
    
    this.http.get<any>('http://localhost/backend/api.php/courses')
    .subscribe({
      next: response => {
        this.courses = response;
        this.categories = new Set(this.courses.map(c => c.category));
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error fetching courses: ',err);
      }
    });
  }

  getTotalStudents(){
    let total = 0;
    for (const user of this.users) {
      if (user.credential == 0) {
        total++;
      }
    }
    return total;
  }
  
  getTotalInstructors(){
    let total = 0;
    for (const user of this.users) {
      if (user.credential == 1) {
        total++;
      }
    }
    return total;
  }
}
