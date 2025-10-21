import { Injectable, inject, signal } from "@angular/core";
import { from, Observable } from "rxjs";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "@angular/fire/auth";
import { User } from "../user.interface";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    firebaseAuth = inject(Auth);
    user$ = this.firebaseAuth;
    currentUser = signal<User | null | undefined>(undefined);

    register(email: string, username: string, password: string):Observable<void> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
        .then(response => {
            updateProfile(response.user, {displayName: username});
        });

        return from(promise);
    }

    login(email: string, password: string):Observable<void> {
        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
        .then(() => {});

        return from(promise);
    }

    logout():Observable<void> {
        const promise = this.firebaseAuth.signOut();
        return from(promise);
    }
}