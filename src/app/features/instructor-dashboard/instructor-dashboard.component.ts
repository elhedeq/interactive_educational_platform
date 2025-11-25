import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [AuthRoutingModule, CommonModule, RouterModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.css'
})
export class InstructorDashboardComponent {
  http = inject(HttpClient);
  authService = inject(AuthService);
  sidebarOpen = false;
  user: any;
  constructor(private router: Router) {   }

  ngOnInit(): void {
    if (this.authService.getCredential() != 1) {
      this.router.navigate(['/home']);
    }
    
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
}
