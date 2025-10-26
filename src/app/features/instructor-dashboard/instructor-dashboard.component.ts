import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [AuthRoutingModule, CommonModule, RouterModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.css'
})
export class InstructorDashboardComponent {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
}
