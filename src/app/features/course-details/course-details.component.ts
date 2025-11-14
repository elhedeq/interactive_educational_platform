import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {

  courses = [
    { id: 1, title: 'Leadership & Management', description: 'Learn how to manage teams and develop leadership skills.', img: '../../../assets/leader course.jpg', category: 'Business', teacher: 'Ahmed', rating: 4.7, duration: '6h 30m', lessons: 12 },
    { id: 2, title: 'Front-End Web Development', description: 'Learn HTML, CSS and JS from scratch.', img: '../../../assets/front course.webp', category: 'Computer Science', teacher: 'Sara', rating: 4.9, duration: '8h 10m', lessons: 18 },
    { id: 3, title: 'Marketing Strategies', description: 'Master marketing fundamentals.', img: '../../../assets/marketing course.webp', category: 'Marketing', teacher: 'Laila', rating: 4.6, duration: '5h 20m', lessons: 10 },
    { id: 4, title: 'Data Science Basics', description: 'Intro to Data Science tools.', img: '../../../assets/data course.webp', category: 'Data Science', teacher: 'Omar', rating: 4.8, duration: '7h 45m', lessons: 16 },
    { id: 5, title: 'Art History', description: 'Explore the history of art.', img: '../../../assets/art course.webp', category: 'Arts', teacher: 'Nora', rating: 4.3, duration: '4h 15m', lessons: 9 },
  ];

  course: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.course = this.courses.find(c => c.id === id) || this.courses[0];
  }

  goToCheckout(courseId: number) {
    this.router.navigate(['/checkout', courseId]);
  }
}
