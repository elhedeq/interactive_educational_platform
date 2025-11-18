import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { inject } from '@angular/core'
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

type Question = {id: number; question_order: number; type: number; head: string; answer: string; quiz: number}

type LessonContent = { id: number; order: number; type: 'lesson'; name: string; description: string; thumbnail?: string; url: string; course: number; questions?: Question[]; showQuestions?: boolean };
type QuizContent = { id: number; order: number; type: 'quiz'; name: string; description: string; thumbnail?: string; url?: string; course: number; questions?: Question[]; showQuestions?: boolean };
type ProjectContent = { id: number; name: string; description: string;  thumbnail?: string; url?: string; course: number; type: 'project'; questions?: Question[]; showQuestions?: boolean };

type CourseContent = LessonContent | QuizContent | ProjectContent;

@Component({
  selector: 'app-view-full-course',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-full-course.component.html',
  styleUrls: ['./view-full-course.component.css']
})

export class ViewFullCourseComponent implements OnInit {

  authService = inject(AuthService);
  http = inject(HttpClient);
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
            if (res.questions.length > 0) {
              this.selectedContent.questions = res.questions;
              this.selectedContent.showQuestions = true;
            } else {
              this.selectedContent.showQuestions = false;
            }
          }
        }, 
        error: (err: any) => {
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
    console.log('Quiz submitted');
  }

}
