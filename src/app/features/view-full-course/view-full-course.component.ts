import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  img?: string;
  instructor?: { name: string; rating?: number; img?: string };
  description?: string;
}

@Component({
  selector: 'app-view-full-course',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-full-course.component.html',
  styleUrls: ['./view-full-course.component.css']
})
export class ViewFullCourseComponent implements OnInit {

  course!: Course;

  courses: Course[] = [
    { id: 1, title: 'Learn about Adobe XD & Prototyping', subtitle: 'Introduction about XD', img: '../../../assets/classroom.jpg', instructor: { name: 'Bulkin Simons', rating: 4.8, img: '../../../assets/instructor.png' }, description: 'Brief about the course' },
    { id: 2, title: 'Front-End Web Development', subtitle: 'HTML, CSS, JS', img: '../../../assets/front course.webp', instructor: { name: 'Sara', rating: 4.9, img: '../../../assets/avatar (1).jpg' }, description: 'Build modern websites' },
    { id: 3, title: 'Data Science Basics', subtitle: 'Intro to Data', img: '../../../assets/data course.webp', instructor: { name: 'Omar', rating: 4.7, img: '../../../assets/student.png' }, description: 'Data fundamentals' }
  ];

  lessons: { id: number; title: string; duration: string; kind?: string }[] = [];
  selectedLesson: { id: number; title: string; duration: string; kind?: string } | null = null;

  sidebarGroups = [
    { title: 'Change Simplification', lessonsKey: 'main' },
    { title: 'Practice Quiz', lessonsKey: 'quiz' }
  ];

  studentAlsoBought: Course[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const param = Number(this.route.snapshot.paramMap.get('id')) || 1;

    this.course = this.courses.find(c => c.id === param) || this.courses[0];

    const counts = [5, 6, 8];
    const count = counts[this.course.id % 3];

    this.lessons = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Lesson ${i + 1}`,     // ← التعديل هنا
      duration: `${20 + (i % 3) * 5} mins`,
      kind: i % 2 === 0 ? 'Lesson' : 'Practice'
    }));

    this.selectedLesson = this.lessons[0];

    this.studentAlsoBought = this.courses.filter(c => c.id !== this.course.id).slice(0, 4);
  }

  selectLesson(l: { id: number; title: string; duration: string }) {
    this.selectedLesson = l;
  }
}
