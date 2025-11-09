import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { checkoutComponent } from './features/checkout/checkout.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule, NavbarComponent,FooterComponent, CommonModule,checkoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'E-learning-final';

  showNavBar: boolean = true;
  showFooter: boolean = true;
  authService = inject(AuthService);

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const currentUrl = this.router.routerState.root.firstChild?.snapshot.url[0]?.path;
        this.showNavBar = !(currentUrl === 'login' || currentUrl === 'signup');
        this.showFooter = !(currentUrl === 'login' || currentUrl === 'signup');
      });
  }

  toggleNavbar(show:boolean){
    this.showNavBar=show
  }
ngOnInit(): void {
  onAuthStateChanged(this.authService.user$, (user) => {
    if(user) {
      this.authService.currentUser.set({
        email: user.email!,
        username: user.displayName!,
        password: ''
      });
    } else {
      this.authService.currentUser.set(null);
    }
  });
  console.log(this.authService.currentUser());
}
}
