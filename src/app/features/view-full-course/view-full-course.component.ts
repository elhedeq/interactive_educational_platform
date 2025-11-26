import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { inject } from '@angular/core'
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../../services/notifications.service';
import { FormsModule } from '@angular/forms';

interface Course {
  id: number;
  name: string;
  description: string;
  thumbnail?: string;
  price: number;
  author: number;
  instructor_first_name: string;
  instructor_last_name: string;
}

type Question = {id: number; question_order: number; type: number; head: string; answer: string; quiz: number; student_answer?:string}

type LessonContent = { id: number; order: number; type: 'lesson'; name: string; description: string; thumbnail?: string; url: string; course: number; questions?: Question[]; showQuestions?: boolean; project_url?:string };
type QuizContent = { id: number; order: number; type: 'quiz'; name: string; description: string; thumbnail?: string; url?: string; course: number; questions?: Question[]; showQuestions?: boolean; project_url?:string };
type ProjectContent = { id: number; name: string; description: string;  thumbnail?: string; url?: string; course: number; type: 'project'; project_url?:string; questions?: Question[]; showQuestions?: boolean };

type CourseContent = LessonContent | QuizContent | ProjectContent;

@Component({
  selector: 'app-view-full-course',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './view-full-course.component.html',
  styleUrls: ['./view-full-course.component.css']
})

export class ViewFullCourseComponent implements OnInit {

  authService = inject(AuthService);
  http = inject(HttpClient);
  notification = inject(Notification);
  course!: Course;

  lessons: LessonContent[] = [];
  quizzes: QuizContent[] = [];
  project: ProjectContent | null = null;
  mergedContent: CourseContent[] = [];
  selectedContent: CourseContent | null = null;

  sidebarGroups = [
    { title: 'Change Simplification', lessonsKey: 'main' },
    { title: 'Practice Quiz', lessonsKey: 'quiz' }
  ];

  relatedCourses: any = [];

  constructor(private route: ActivatedRoute, private router: Router) {  }

  async ngOnInit(){
    const param = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.http.get(`http://localhost/backend/api.php/courses/${param}`)
    .subscribe({
      next: (response:any) => {
        this.course = response;
        const lessons = response.lessons.map((lesson: any) => ({
          ...lesson,
          name: lesson.title,
          order: lesson.lesson_order,
          type: 'lesson'
        }));
        const quizzes = response.quizzes.map((quiz: any) => ({
          ...quiz,
          order: quiz.quiz_order,
          type: 'quiz'
        }));
        let project = response.projects;
        project.order = lessons.length + quizzes.length + 1;
        project.type = 'project';
        this.mergedContent = [...lessons, ...quizzes, project];
        this.selectedContent = this.mergedContent[0] || null;
        this.resetVideo();
      },
      error: (err) => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('Error fetching course data:', err);
        if (err.status === 403) {
          this.router.navigate(['/home']); 
        }
      }
    });
    
  }
  
  selectItem(item: CourseContent) {
    this.selectedContent = item;
    if (item.type === 'lesson') {
      this.resetVideo();
    } else if (item.type === 'quiz') {
      this.http.get(`http://localhost/backend/api.php/quizzes/${item.id}/questions`)
      .subscribe({
        next: (res:any) => {
          if (this.selectedContent) {
            if (res.length > 0) {
              this.selectedContent.questions = res;
              this.selectedContent.questions?.forEach(q=> q.student_answer = '');
              this.selectedContent.showQuestions = true;
            } else {
              this.selectedContent.showQuestions = false;
            }
          }
        }, 
        error: (err: any) => {
          this.notification.showNotification('somthing went wrong',1000,'danger');
          console.error('Error fetching questions:', err);
        }
      });
    }
  }

  playVideo() {
    const videoPlayer = document.getElementById('video-player');
    const videoThumbnail = document.getElementById('thumbnail');
    if (!videoPlayer || !videoThumbnail) return;
    videoThumbnail!.style.display = 'none';
    videoPlayer!.style.display = 'block';
    (videoPlayer as HTMLVideoElement).autoplay = true;
  }

  resetVideo() {
    const videoPlayer = document.getElementById('video-player');
    const videoThumbnail = document.getElementById('thumbnail');
    if (!videoPlayer || !videoThumbnail) return;
    videoThumbnail!.style.display = 'block';
    videoPlayer!.style.display = 'none';
    (videoPlayer as HTMLVideoElement).autoplay = true;
  }

  onSubmitQuiz() {
    if (this.selectedContent?.questions) {
      for (const q of this.selectedContent?.questions) { //submit all answers
        this.http.post(`http://localhost/backend/api.php/questions/${q.id}/answer`,{answer:q.student_answer})
        .subscribe({
          next: response => {
            this.notification.showNotification('your answer has been submitted successfully',1000, 'success');
          },
          error: err => {
            if (err.status === 200) { // if answer already exists an erro is returned but the satus code is 200 indicating that the request is processed successfully
              // if answer already exists update it
              this.http.put<any>(`http://localhost/backend/api.php/questions/${q.id}/answer`,{answer:q.student_answer})
              .subscribe({
                next: response => {
                  this.notification.showNotification('your answer has been updated successfully',1000, 'success');
                },
                error: err => {
                  this.notification.showNotification('somthing went wrong',1000,'danger');
                  console.error('error updating answer: ', err);
                }
              });
            } else {
              this.notification.showNotification('somthing went wrong',1000,'danger');
              console.error('error submitting answer: ', err);
            }
          }
        });
      }
    }
  }


  onSubmitProject() {
    if (this.selectedContent && this.selectedContent.project_url) {
      this.http.post(`http://localhost/backend/api.php/submissions`,{project: this.selectedContent?.id, url:this.selectedContent?.project_url})
      .subscribe({
        next: response => {
          this.notification.showNotification('your project has been submitted successfully',1000, 'success');
        },
        error: err => {
          if (err.status === 200) { // if answer already exists an erro is returned but the satus code is 200 indicating that the request is processed successfully
            // if answer already exists update it
            this.http.put<any>(`http://localhost/backend/api.php/submissions/${this.selectedContent?.id}`,{url:this.selectedContent?.project_url})
            .subscribe({
              next: response => {
                this.notification.showNotification('your project has been updated successfully',1000, 'success');
              },
              error: err => {
                this.notification.showNotification('somthing went wrong',1000,'danger');
                console.error('error updating project: ', err);
              }
            });
          } else {
            this.notification.showNotification('somthing went wrong',1000,'danger');
            console.error('error submitting project: ', err);
          }
        }
      });
    }
  }

}
