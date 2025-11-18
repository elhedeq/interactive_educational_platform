import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {

  http = inject(HttpClient);
  course:any = null;
  
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.http.get(`http://localhost/backend/api.php/courses/${this.route.snapshot.paramMap.get('id')}/preview`)
    .subscribe({
      next: (response:any) => {
        this.course = response;
      },
      error: (err) => {
        console.error('Error fetching course details:', err);
      }
    })
  }

  goToCheckout(courseId: number) {
    this.router.navigate(['/checkout', courseId]);
  }
}
