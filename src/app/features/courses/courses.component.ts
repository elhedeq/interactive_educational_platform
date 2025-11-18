import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit{
  categories: Set<string>=new Set<string>();
  selectedCategory: string = '';
  http = inject(HttpClient);

  courses:{id:number,name:string,description:string,thumbnail:string,price:number,author:number,category:string,instructor_first_name:string,instructor_last_name:string}[] = [];

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost/backend/api.php/courses')
    .subscribe({
      next: (data) => {
        this.courses = data;
        this.categories = new Set(data.map(c => c.category));
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
      }
    })
  }

  filterByCategory(catName: string) {
    this.selectedCategory = catName;
  }

  get filteredCourses() {
    if (!this.selectedCategory) return this.courses;
    return this.courses.filter(c => c.category === this.selectedCategory);
  }

  // get topCourses() {
  //   return this.courses.filter(c => c.rating >= 4.7);
  // }

  get newCourses() {
    return this.courses.sort((a, b) => b.id - a.id).slice(0, 3);
  }

  showMoreCourses() {
    // ممكن نعملها بعدين لما نضيف pagination أو lazy loading
  }
}