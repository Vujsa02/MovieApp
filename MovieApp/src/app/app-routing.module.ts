import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent} from "./home/home.component";
import {RegisterComponent} from "./auth/register/register.component";
import {LoginComponent} from "./auth/login/login.component";
import {AuthGuard} from "./auth/auth-guard.service";
import {MovieDetailsComponent} from "./movie/movie-details/movie-details.component";
import {MovieUploadComponent} from "./movie/movie-upload/movie-upload.component";

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component:HomeComponent, canActivate:[AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'details/:movieId/:createdAt', component:MovieDetailsComponent },
  { path: 'upload', component:MovieUploadComponent },];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
