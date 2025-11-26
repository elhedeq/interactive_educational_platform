import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, NgForOf } from "@angular/common";
import { AuthRoutingModule } from "../../../auth/auth-routing.module";
import { RouterModule } from '@angular/router';
import { Notification } from '../../../services/notifications.service';


@Component({
  selector: 'app-usercourses',
  standalone: true,
  imports: [NgForOf, AuthRoutingModule, CommonModule, RouterModule],
  templateUrl: './usercourses.component.html',
  styleUrl: './usercourses.component.css'
})
export class UsercoursesComponent implements OnInit {
  http = inject(HttpClient);
  notification = inject(Notification);
  authService = inject(AuthService);

  courses:any[] = [];
  

  ngOnInit(): void {
    this.http.get<any>(`http://localhost/backend/api.php/users/${this.authService.getId()}/enrolled-courses`)
    .subscribe({
      next: response => {
        this.courses = response;
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error fetching enrolled courses: ',err);
      }
    });
  }
}
