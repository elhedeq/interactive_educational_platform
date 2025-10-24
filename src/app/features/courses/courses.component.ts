import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent {
  selectedCategory: string = '';

  courses = [
    { title: 'Leadership & Management', category: 'Business', teacher: 'Ahmed', rating: 4.7, date: '2025-09-10', img: '../../../assets/leader course.jpg' },
    { title: 'Front-End Web Development', category: 'Computer Science', teacher: 'Sara', rating: 4.9, date: '2025-09-20', img: '../../../assets/front course.webp' },
    { title: 'Marketing Strategies', category: 'Marketing', teacher: 'Laila', rating: 4.6, date: '2025-10-01', img: '../../../assets/marketing course.webp' },
    { title: 'Data Science Basics', category: 'Data Science', teacher: 'Omar', rating: 4.8, date: '2025-10-05', img: '../../../assets/data course.webp' },
    { title: 'Art History', category: 'Arts and Humanities', teacher: 'Nora', rating: 4.3, date: '2025-08-28', img: '../../../assets/art course.webp' },
  ];

  filterByCategory(catName: string) {
    this.selectedCategory = catName;
  }

  get filteredCourses() {
    if (!this.selectedCategory) return this.courses;
    return this.courses.filter(c => c.category === this.selectedCategory);
  }

  get topCourses() {
    return this.courses.filter(c => c.rating >= 4.7);
  }

  get newCourses() {
    return this.courses.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3);
  }
}