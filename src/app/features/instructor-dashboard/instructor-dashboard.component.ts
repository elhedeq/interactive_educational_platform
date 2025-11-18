import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [AuthRoutingModule, CommonModule, RouterModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.css'
})
export class InstructorDashboardComponent {
  authService = inject(AuthService);
  constructor(private router: Router) {   }
  
}
