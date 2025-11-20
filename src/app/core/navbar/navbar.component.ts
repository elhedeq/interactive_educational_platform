import { Component,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { AuthService } from '../../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AuthRoutingModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: any;
  authService = inject(AuthService);
  authorized: boolean = false;

  isAuthorized(): boolean {
    this.user = this.authService.currentUser();
    return this.user !== null && (this.user.credential > 0);
  }

  constructor(private router:Router) { }

  // menue of user profile if we going to open or close it
  isProfileMenueOpen=false
  toggleMenu(){
     this.isProfileMenueOpen=!this.isProfileMenueOpen
  }

  @HostListener('document:click',['$event'])
  clickOutside(event:MouseEvent){
    const target=event.target as HTMLElement
    if (!target.closest('.ml-3')) {
      this.isProfileMenueOpen = false;
    }
  }

  closeMenue(){
   this.isProfileMenueOpen=false
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  gotoProfile(){
    this.router.navigate(['/userprofile']);
  }

  gotoDashboard(){
    this.user = this.authService.currentUser();
    if (this.user) {
      if (this.user.credential == 1) {
        this.router.navigate(['/instructor']);
      } else if (this.user.credential == 2) {
        this.router.navigate(['/admin']);
      }
    }
  }

}
