import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [AuthRoutingModule,RouterModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent {
  authService = inject(AuthService);
  http = inject(HttpClient);
  id=this.authService.currentUser()?.id;
  name=this.authService.currentUser()?.first_name + ' ' + this.authService.currentUser()?.last_name;
  avatar=this.authService.currentUser()?.avatar;
  bio=this.authService.currentUser()?.bio;
  
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.http.get(`http://localhost/backend/api.php/users/me`)
    .subscribe({
      next: (data:any) => {
        this.id=data.id;
        this.name=data.first_name + ' ' + data.last_name;
        this.avatar=data.avatar;
        this.bio=data.bio;
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.router.navigate(['/home']);
      }
    });
  }

  deleteAccount() {
    if (this.id) {
      this.http.delete(`http://localhost/backend/api.php/users/${this.id}`)
      .subscribe({
        next: () => {
          console.log('Account deleted successfully');
          window.localStorage.removeItem('token');
          window.alert('Your account has been deleted.');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error deleting account:', err);
        }
      });
    } else {
      console.error('User ID is not available.');
    }
  }

}
