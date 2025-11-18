import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule, NavbarComponent,FooterComponent, SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'E-learning-final';

  showNavBar: boolean = true;
  showFooter: boolean = true;
  showSidebar: boolean = false;
  authService = inject(AuthService);
  http = inject(HttpClient);

  ngOnInit(): void {
    this.authService.loadUserFromToken();
  }

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const currentUrl = this.router.routerState.root.firstChild?.snapshot.url[0]?.path;
        this.showFooter = !(currentUrl === 'login' || currentUrl === 'signup' || currentUrl === 'instructor');
        this.showSidebar = !(currentUrl === 'instructor');
      });
  }

  toggleNavbar(show:boolean){
    this.showNavBar=show
  }
}

