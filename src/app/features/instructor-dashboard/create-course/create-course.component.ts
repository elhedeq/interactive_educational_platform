import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgIf, NgForOf } from "@angular/common";
import { Notification } from '../../../services/notifications.service';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.css'
})
export class CreateCourseComponent implements OnInit {
  courseForm:HTMLElement | null = null;
  LessonsForm:HTMLElement | null = null;
  quizzesForm:HTMLElement | null = null;
  projectForm:HTMLElement | null = null;
  operation:string = 'create';
  id:number = 0;
  name: string = '';
  description: string = '';
  thumbnail: string = '';
  price: number | null = null;
  category: string = '';
  lessons: any[] = [];
  quizzes: any[] = [];
  projects: any[] = [];
  newProject:{id:number;name:string;description:string;course:number}={id:0,name:'',description:'',course:0};
  http = inject(HttpClient);
  notification = inject(Notification);


  constructor(private route: ActivatedRoute, private router: Router) {  }

  ngOnInit(): void {
    this.courseForm = document.getElementById('course');
    this.LessonsForm = document.getElementById('lessons');
    this.quizzesForm = document.getElementById('quizzes');
    this.projectForm = document.getElementById('project');
    this.switchForm(1);
    this.id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (this.id === 0) {
      return;
    }
    this.http.get<any>(`http://localhost/backend/api.php/courses/${this.id}`)
    .subscribe({
      next: response=> {
        this.operation = 'edit';
        this.name = response.name;
        this.description = response.description;
        this.thumbnail = response.thumbnail;
        this.price = response.price;
        this.category = response.category;
        this.lessons = response.lessons || [];
        this.quizzes = response.quizzes || [];
        if (response.projects) {
          this.projects = Array.isArray(response.projects) ? response.projects : [response.projects];
        } else {
            this.projects = [];
        }
        for (const quiz of this.quizzes) {
          this.http.get(`http://localhost/backend/api.php/quizzes/${quiz.id}/questions`)
          .subscribe({
            next: response => {
              quiz.questions = response;
            },
            error: err => {
              this.notification.showNotification('somthing went wrong',1000,'danger');
              console.error('error getting quiz questions: ', err);
            }
          });
        }
      },
      error: err => {
        this.operation = 'create';
      }
    });
  }

  submitCourseData():void {
    let data = {
      name: this.name,
      description: this.description,
      thumbnail: 'https://pursico.com/wp-content/uploads/2023/03/AdobeStock_137423796-scaled.jpeg',
      price: this.price || 0,
      category: this.category
    }
    if (this.operation === 'create') {
      this.http.post<any>('http://localhost/backend/api.php/courses', data)
      .subscribe({
        next: response =>{
          this.id = response.id;
          this.notification.showNotification(`saved course ${this.name}`, 1000, 'success');
          this.switchForm(2); //show lessons form
        },
        error: err => {
          console.error('error creating course:',err);
          this.notification.showNotification("sorry couldn't create course!", 1000, 'danger');
        }
      });
    } else {
      this.http.put<any>(`http://localhost/backend/api.php/courses/${this.id}`, data)
      .subscribe({
        next: response =>{
          this.notification.showNotification(`updated course ${this.name}`, 1000, 'success');
          this.switchForm(2); //show lessons form
        },
        error: err => {
          console.error('error updating course:',err);
          this.notification.showNotification("sorry couldn't update course!", 1000, 'danger');
        }
      });
    }
  }

  saveLesson(index:number, event:any) {
    let lesson = this.lessons[index];
    lesson.course = this.id;
    
    if (!lesson.id) {
      this.http.post<any>(`http://localhost/backend/api.php/courses/${this.id}/lessons`, lesson)
      .subscribe({
        next: response =>{
          lesson.id = response.id;
          this.notification.showNotification(`saved lesson ${lesson.title}`, 1000, 'success');
          let lessonInputs:any[] = Array.from(event.target.parentNode.getElementsByTagName('input'));
          lessonInputs.push(...Array.from(event.target.parentNode.getElementsByTagName('textarea')));
          if(lessonInputs){
            for (const input of Array.from(lessonInputs)) {
              input.setAttribute('disabled', 'disabled');
            }
          }
        },
        error: err => {
          console.error('error creating lesson:',err);
          this.notification.showNotification("sorry couldn't create lesson!", 1000, 'danger');
        }
      });
    } else {
      this.http.put<any>(`http://localhost/backend/api.php/courses/${this.id}/lessons/${lesson.id}`, lesson)
      .subscribe({
        next: response =>{
          this.notification.showNotification(`updated lesson ${lesson.title}`, 1000, 'success');
        },
        error: err => {
          console.error('error updating course:',err);
          this.notification.showNotification("sorry couldn't update lesson!", 1000, 'danger');
        }
      });
    }
  }

  saveQuiz(index: number, event:any) {
    let quiz = this.quizzes[index];
    quiz.course = this.id;

    if (!quiz.id) {
      this.http.post<any>(`http://localhost/backend/api.php/courses/${this.id}/quizzes`, quiz)
        .subscribe({
          next: response => {
            quiz.id = response.id; 
            this.saveQuestions(quiz);
            this.notification.showNotification(`saved quiz ${quiz.name}`, 1000, 'success');
            let quizInputs:any[] = Array.from(event.target.parentNode.getElementsByTagName('input'));
            quizInputs.push(...Array.from(event.target.parentNode.getElementsByTagName('textarea')));
            if(quizInputs){
              for (const input of Array.from(quizInputs)) {
                input.setAttribute('disabled', 'disabled');
              }
            }
          },
          error: err => {
            console.error('Error creating quiz:', err);
            this.notification.showNotification("Sorry, couldn't create quiz!", 1000, 'danger');
          }
        });
    } else {
      this.http.put<any>(`http://localhost/backend/api.php/courses/${this.id}/quizzes/${quiz.id}`, quiz)
        .subscribe({
          next: response => {
          this.notification.showNotification(`updated quiz ${quiz.name}`, 1000, 'success');
            this.saveQuestions(quiz);
          },
          error: err => {
            console.error('Error updating quiz:', err);
            this.notification.showNotification("Sorry, couldn't update quiz!", 1000, 'danger');
          }
        });
    }
  }

  // Helper function to loop through and save questions
  saveQuestions(quiz: any) {
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((question: any) => {
        question.quiz = quiz.id; // Ensure question is linked to the quiz
        
        // If question is new (no ID), POST it. If existing, PUT it.
        if (!question.id) {
            this.http.post<any>(`http://localhost/backend/api.php/quizzes/${quiz.id}/questions`, question)
            .subscribe({
              next: res => console.log('Question saved:', res),
              error: err => {
                this.notification.showNotification('somthing went wrong',1000,'danger');
                console.error('Error saving question:', err)
              }
            });
        } else {
             // Optional: Add PUT logic here if you want to update existing questions
        }
      });
    }
  }

  saveProject() {
    let project = (this.projects && this.projects.length > 0) ? this.projects[0] : null;
    if(project){
      project.course = this.id;
    }
    
    if (this.operation === 'create') {
      this.http.post<any>(`http://localhost/backend/api.php/courses/${this.id}/project`, this.newProject)
      .subscribe({
        next: response =>{
          this.notification.showNotification(`completed creating course successfuly!`, 1000, 'success');
          this.router.navigate([`/view-full-course/${this.id}`]);
        },
        error: err => {
          console.error('error creating project:',err);
          this.notification.showNotification("sorry couldn't create project!", 1000, 'danger');
        }
      });
    } else {
      this.http.put<any>(`http://localhost/backend/api.php/courses/${this.id}/project/${project.id}`, project)
      .subscribe({
        next: response =>{
          this.notification.showNotification(`completed updating course successfuly!`, 1000, 'success');
          this.router.navigate([`/view-full-course/${this.id}`]);
        },
        error: err => {
          console.error('error updating project:',err);
          this.notification.showNotification("sorry couldn't update project!", 1000, 'danger');
        }
      });
    }
  }

  addLessonForm() {
    let order = this.lessons.length + 1 || 1;
    this.lessons.push({
      lesson_order: order,
      title: '',
      description: '',
      url: '',
      thumbnail: null
    })
  }

  removeLesson(index: number) {
    let lesson = this.lessons[index];

    // Check if lesson exists in DB
    if (lesson.id) {
      this.http.delete<any>(`http://localhost/backend/api.php/courses/${this.id}/lessons/${lesson.id}`)
        .subscribe({
          next: response => {
            this.notification.showNotification(`Removed lesson`, 1000, 'success');
            this.lessons.splice(index, 1);
          },
          error: err => {
            this.notification.showNotification(`Could not delete lesson from database.`, 1000, 'danger');
            console.error('Error removing lesson', err);
          }
        });
    } else {
      // Local removal only
      this.lessons.splice(index, 1);
    }
  }

  addQuizForm() {
    let order = this.quizzes.length + 1 || 1;
    this.quizzes.push({
      quiz_order: order,
      name: '',
      description: '',
      questions: []
    })
  }

  removeQuiz(index: number) {
    let quiz = this.quizzes[index];

    // Check if the quiz has been saved to DB (has an ID)
    if (quiz.id) {
      this.http.delete<any>(`http://localhost/backend/api.php/courses/${this.id}/quizzes/${quiz.id}`)
        .subscribe({
          next: response => {
            this.notification.showNotification(`Removed quiz`, 1000, 'success');
            this.quizzes.splice(index, 1); // Remove from array after DB success
          },
          error: err => {
            console.error('Error removing quiz', err);
            this.notification.showNotification(`Could not delete quiz from database.`, 1000, 'danger');
          }
        });
    } else {
      // If it hasn't been saved yet, just remove it from the local array
      this.quizzes.splice(index, 1);
    }
  }

  addQuestionForm(index:number) {
    if (this.quizzes[index].questions) {
      let order = this.quizzes[index].questions.length + 1 || 1;
      this.quizzes[index].questions.push({
        question_order: order,
        type: 1,
        head: '',
        answer: '',
        quiz: this.quizzes[index].id
      });
    } else {
      this.notification.showNotification('somthing went wrong',1000,'danger');
      console.error('error generating form');
    }
  }

  removeQuestion(quizIndex: number, questionIndex: number) {
    let quiz = this.quizzes[quizIndex];
    let question = quiz.questions[questionIndex];

    // If question exists in DB (has ID), delete from API
    if (question.id) {
       // Note: Ensure your API supports DELETE /questions/{id} 
       // Your api.php seems to support DELETE /questions/{id} based on line 677
       this.http.delete(`http://localhost/backend/api.php/questions/${question.id}`)
       .subscribe({
         next: () => {
           quiz.questions.splice(questionIndex, 1);
         },
         error: (err) => {
          this.notification.showNotification('somthing went wrong',1000,'danger');
          console.error("Error deleting question", err)
        }
       })
    } else {
      // Local removal only
      quiz.questions.splice(questionIndex, 1);
    }
  }

  switchForm(form:number) {
    if(this.courseForm && this.LessonsForm && this.quizzesForm && this.projectForm){
      switch (form) {
        case 1:
            this.courseForm.style.display = 'block';
            this.LessonsForm.style.display = 'none';
            this.quizzesForm.style.display = 'none';
            this.projectForm.style.display = 'none';
          break;
        case 2:
            this.courseForm.style.display = 'none';
            this.LessonsForm.style.display = 'block';
            this.quizzesForm.style.display = 'none';
            this.projectForm.style.display = 'none';
          break;
        case 3:
            this.courseForm.style.display = 'none';
            this.LessonsForm.style.display = 'none';
            this.quizzesForm.style.display = 'block';
            this.projectForm.style.display = 'none';
          break;
        case 4:
            this.courseForm.style.display = 'none';
            this.LessonsForm.style.display = 'none';
            this.quizzesForm.style.display = 'none';
            this.projectForm.style.display = 'block';
          break;
      
        default:
            this.courseForm.style.display = 'block';
            this.LessonsForm.style.display = 'none';
            this.quizzesForm.style.display = 'none';
            this.projectForm.style.display = 'none';
          break;
      }
    }
  }

}
