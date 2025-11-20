import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AuthRoutingModule, CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  sidebarOpen = false;
  constructor(private router: Router) {   }

  ngOnInit(): void {
    if (this.authService.getCredential() != 2) {
      this.router.navigate(['/home']);
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

}
