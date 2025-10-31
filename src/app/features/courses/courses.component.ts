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
  visibleCoursesCount: number = 4; // عدد الكورسات المعروضة مبدئيًا

  courses = [
    { title: 'Leadership & Management', category: 'Business', teacher: 'Ahmed', rating: 4.7, date: '2025-09-10', img: '../../../assets/leader course.jpg' },
    { title: 'Front-End Web Development', category: 'Computer Science', teacher: 'Sara', rating: 4.9, date: '2025-09-20', img: '../../../assets/front course.webp' },
    { title: 'Marketing Strategies', category: 'Marketing', teacher: 'Laila', rating: 4.6, date: '2025-10-01', img: '../../../assets/marketing course.webp' },
    { title: 'Data Science Basics', category: 'Data Science', teacher: 'Omar', rating: 4.8, date: '2025-10-05', img: '../../../assets/data course.webp' },
    { title: 'Art History', category: 'Arts and Humanities', teacher: 'Nora', rating: 4.3, date: '2025-08-28', img: '../../../assets/art course.webp' },
    { title: 'Business Communication', category: 'Business', teacher: 'Hana', rating: 4.5, date: '2025-08-15', img: '../../../assets/leader course.jpg' },
    { title: 'Machine Learning Intro', category: 'Data Science', teacher: 'Youssef', rating: 4.9, date: '2025-10-15', img: '../../../assets/data course.webp' },
    { title: 'Digital Marketing 101', category: 'Marketing', teacher: 'Mona', rating: 4.4, date: '2025-10-10', img: '../../../assets/marketing course.webp' },
    { title: 'UI/UX Design', category: 'Computer Science', teacher: 'Ali', rating: 4.8, date: '2025-10-20', img: '../../../assets/front course.webp' },
  ];

  filterByCategory(catName: string) {
    this.selectedCategory = catName;
    this.visibleCoursesCount = 4; // كل مرة يفلتر يبدأ بـ4 بس
  }

  get filteredCourses() {
    const filtered = this.selectedCategory
      ? this.courses.filter(c => c.category === this.selectedCategory)
      : this.courses;
    return filtered.slice(0, this.visibleCoursesCount);
  }

  showMoreCourses() {
    this.visibleCoursesCount += 8; // كل ضغطة تعرض ٨ كورسات زيادة
  }

  get topCourses() {
    return this.courses.filter(c => c.rating >= 4.7);
  }

  get newCourses() {
    return this.courses.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3);
  }
}