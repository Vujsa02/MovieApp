import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./auth/login/login.component";
import {RegisterComponent} from "./auth/register/register.component";
import {MovieDetailsComponent} from "./movie/movie-details/movie-details.component";
import {MovieUploadComponent} from "./movie/movie-upload/movie-upload.component";

export const routes: Routes = [
  // { path: '', component:HomeComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component:HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

];
