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
  authService = inject(AuthService);

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

}
