import { Injectable, inject, signal, PLATFORM_ID } from "@angular/core";
import { from, Observable } from "rxjs";
import { User } from "../user.interface";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    currentUser = signal<User | undefined | null>(null);
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private apiUrl = 'http://localhost/backend/api.php'; 

    // check for token and load user data
    loadUserFromToken(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const token = localStorage.getItem('token');

        if (token) {
            this.http.get<User>(`${this.apiUrl}/users/me`).subscribe({
                next: (user: User) => {
                    // Success: The token is valid, set the current user
                    this.currentUser.set(user);
                    console.log('User restored from token:', user.email);
                },
                error: (err) => {
                    // Failure: Token is invalid, expired, or server error.
                    this.logout(); 
                    console.error('Failed to validate token or fetch user data:', err);
                }
            });
        }
    }
    
    logout():void {
        localStorage.removeItem('token');
        this.currentUser.set(null);
    }
    
}