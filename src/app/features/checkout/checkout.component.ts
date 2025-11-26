import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Notification } from '../../services/notifications.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  imports: [FormsModule, CommonModule],
})
export class CheckoutComponent implements OnInit {
  courseId!: number;
  summary: any = [];
  http = inject(HttpClient);
  notification = inject(Notification);

  discount = 1;
  tax = 4.20;
  
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // قراءة courseId من الرابط
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get(`http://localhost/backend/api.php/courses/${this.courseId}/preview`)
    .subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (err) => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('Error fetching course summary:', err);
      }
    })
  }
  
  total() {
    return (this.summary.price || 0) - this.discount + this.tax;
  }

  confirmPayment() {
    this.notification.showNotification('Payment Confirmed!',1000, 'success');
    // Navigate to View Full Course page
    this.http.post(`http://localhost/backend/api.php/subscriptions`, {"course": this.courseId})
    .subscribe({
      next: (data) => {
        this.router.navigate(['/view-full-course', this.courseId]);
      },
      error: (err) => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('Error during subscription:', err);
      }
    });
  }
}