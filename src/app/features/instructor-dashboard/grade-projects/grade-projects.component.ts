import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgForOf } from "@angular/common";
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../../services/notifications.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-grade-projects',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule],
  templateUrl: './grade-projects.component.html',
  styleUrl: './grade-projects.component.css'
})
export class GradeProjectsComponent implements OnInit{
  courseId:number = 0;
  project:any = [];
  submissions:any[] = [];
  http = inject(HttpClient);
  notification = inject(Notification);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.http.get<any>(`http://localhost/backend/api.php/courses/${this.courseId}/project`)
    .subscribe({
      next: response => {
        this.project = response;
        this.http.get<any>(`http://localhost/backend/api.php/courses/${this.courseId}/submissions`)
        .subscribe({
          next: response => {
            this.submissions = response;
          },
          error: err => {
            this.notification.showNotification('somthing went wrong',1000,'danger');
            console.error('error fetching submissions: ',err);
          }
        });
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error fetching project: ',err);
      }
    });
  }

  submitGrade(index:number) {
    let sub = this.submissions[index];
    let data = {
      student_id: sub.student_id,
      grade: sub.grade,
      comment: sub.comment
    }
    this.http.put(`http://localhost/backend/api.php/submissions/${this.project.id}`,data)
    .subscribe({
      next: response => {
        this.notification.showNotification(`submitted grade for student ${sub.first_name + ' ' + sub.last_name}`, 1000, 'success');
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error submitting grade ', err);
      }
    });
  }

  getTotalSubmissions() {
    return this.submissions.length || 0;
  }

}
