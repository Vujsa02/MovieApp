import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent} from "./home/home.component";
import {RegisterComponent} from "./auth/register/register.component";
import {LoginComponent} from "./auth/login/login.component";
import {AuthGuard} from "./auth/auth-guard.service";
import {MovieDetailsComponent} from "./movie/movie-details/movie-details.component";
import {MovieUploadComponent} from "./movie/movie-upload/movie-upload.component";
import {SubscribeComponent} from "./sub/subscribe/subscribe.component";
import {MovieUpdateComponent} from "./movie/movie-update/movie-update.component";
import {SeriesUploadComponent} from "./series/series-upload/series-upload.component";
import {EpisodeUploadComponent} from "./series/episode-upload/episode-upload.component";
import {EpisodeUpdateComponent} from "./series/episode-update/episode-update.component";

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component:HomeComponent, canActivate:[AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'details/:movieId/:createdAt', component:MovieDetailsComponent },
  { path: 'upload/movies', component:MovieUploadComponent },
  { path: 'subscribe', component:SubscribeComponent, canActivate:[AuthGuard] },
  { path: 'update/movie/:movieId/:createdAt', component:MovieUpdateComponent },
  { path: 'upload/series' , component:SeriesUploadComponent},
  { path: 'upload/episode/:movieId/:createdAt' , component:EpisodeUploadComponent},
  { path: 'update/episode/:movieId/:createdAt', component:EpisodeUpdateComponent },

  ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
