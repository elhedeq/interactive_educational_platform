import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let token: string | null = null;

    if (isPlatformBrowser(this.platformId)) {
        token = localStorage.getItem('token');
    }
    
    if (!token) {
      // No token, redirect to home
      this.router.navigate(['/home']);
      return false;
    }
    
    // Token exists, allow access
    return true;
  }
}
