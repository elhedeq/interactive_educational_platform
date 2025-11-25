import { Component, inject, OnInit } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../../services/notifications.service';
import { ActivatedRoute, Event } from '@angular/router';
import { response } from 'express';

@Component({
  selector: 'app-grade-quizzes',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule],
  templateUrl: './grade-quizzes.component.html',
  styleUrl: './grade-quizzes.component.css'
})
export class GradeQuizzesComponent implements OnInit{
  http = inject(HttpClient);
  notification = inject(Notification);
  quizzes: any[] = [];
  courseId:number =0;

  constructor(private route: ActivatedRoute) {  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.http.get<any>(`http://localhost/backend/api.php/courses/${this.courseId}/quizzes`)
    .subscribe({
      next: response => {
        this.quizzes = response;
        for (const quiz of this.quizzes) {
          this.http.get<any>(`http://localhost/backend/api.php/quizzes/${quiz.id}/all-answers`)
          .subscribe({
            next: response => {
              quiz.questions = response;
            },
            error: err => {
              console.log('error fetching questions answers: ',err);
            }
          });
        }
      },
      error: err => {
        console.log('error fetching quizzes: ', err);
      }
    });
  }

  submitGrade(quiz:number, question:number, ans:number) {
    let q = this.quizzes[quiz].questions[question];
    let answer = q.answers[ans];
    let data = {
      grade: answer.grade,
      comment: answer.comment,
      student_id: answer.student_id
    }
    this.http.put(`http://localhost/backend/api.php/questions/${q.question_id}/answer`, data)
    .subscribe({
      next: response => {
        this.notification.showNotification(`submitted grade successfully`, 1000, 'success');
      },
      error: err => {
        console.log('error submitting grade: ',err);
      }
    });
  }

  collapseQuiz(event:any) {
    let q = document.getElementById('quiz')
    if (q) {
      if (q.style.height === '100px') {
        console.log(q.style.height);
        q.style.height = 'auto';
      }
      q.style.height = '100px';
      event.target.style.transform = 'rotate(180deg)';
    }
  }
  
  collapseQuestion(event:any) {
    let q = event.target.parentNode;
    if (q) {
      if (q.style.height === '100px') {
        q.style.height = 'fit-content';
      }
      q.style.height = '100px';
      event.target.style.transform = 'rotate(180deg)';
    }
  }

}
