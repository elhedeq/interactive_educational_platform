import { Component,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

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



}
