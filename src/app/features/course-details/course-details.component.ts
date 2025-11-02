import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent {
  courseId: number | null = null;
  course: any;

  courses = [
    { id: 1, title: 'Leadership & Management', category: 'Business', teacher: 'Ahmed', rating: 4.7, duration: '6h 30m', lessons: 12, img: '../../../assets/leader course.jpg', description: 'Learn how to manage teams and develop leadership skills.' },
    { id: 2, title: 'Front-End Web Development', category: 'Computer Science', teacher: 'Sara', rating: 4.9, duration: '8h 45m', lessons: 20, img: '../../../assets/front course.webp', description: 'Master HTML, CSS, and JavaScript to build modern websites.' },
    { id: 3, title: 'Marketing Strategies', category: 'Marketing', teacher: 'Laila', rating: 4.6, duration: '5h 15m', lessons: 10, img: '../../../assets/marketing course.webp', description: 'Understand customer behavior and build powerful marketing campaigns.' },
    { id: 4, title: 'Data Science Basics', category: 'Data Science', teacher: 'Omar', rating: 4.8, duration: '7h 10m', lessons: 15, img: '../../../assets/data course.webp', description: 'Introduction to data analysis, visualization, and Python tools.' },
    { id: 5, title: 'Art History', category: 'Arts and Humanities', teacher: 'Nora', rating: 4.3, duration: '4h 50m', lessons: 9, img: '../../../assets/art course.webp', description: 'Explore the history and evolution of fine arts and artists.' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.course = this.courses.find(c => c.id === this.courseId);
  }
}