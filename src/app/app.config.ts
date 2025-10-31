import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './auth/login/login.component';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {

  apiKey: "AIzaSyCuqFctx3QS1FkGFlJUnVUlh5sW6j294IU",

  authDomain: "depi-app-1eb71.firebaseapp.com",

  projectId: "depi-app-1eb71",

  storageBucket: "depi-app-1eb71.firebasestorage.app",

  messagingSenderId: "180427090649",

  appId: "1:180427090649:web:d716bdd731127955b9acc8"

};


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(), provideFirebaseApp(() => initializeApp(firebaseConfig)), provideAuth(() => getAuth())]
};
