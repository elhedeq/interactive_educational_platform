import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  imports: [FormsModule, CommonModule],
})
export class CheckoutComponent implements OnInit {
  courseId!: number;
  summary: any[] = [];

  courses = [
    { id: 1, title: 'Leadership & Management', price: '$24.69', image: '../../../assets/leader course.jpg' },
    { id: 2, title: 'Front-End Web Development', price: '$24.69', image: '../../../assets/front course.webp' },
    { id: 3, title: 'Marketing Strategies', price: '$24.69', image: '../../../assets/marketing course.webp' },
    { id: 4, title: 'Data Science Basics', price: '$24.69', image: '../../../assets/data course.webp' },
    { id: 5, title: 'Art History', price: '$24.69', image: '../../../assets/art course.webp' },
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // قراءة courseId من الرابط
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    const selectedCourse = this.courses.find(c => c.id === this.courseId);
    if (selectedCourse) {
      this.summary = [selectedCourse];
    }
  }

  confirmPayment() {
    console.log('Payment Confirmed!');
    // Navigate to View Full Course page
    this.router.navigate(['/view-full-course', this.courseId]);
  }
}