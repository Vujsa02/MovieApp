import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {MovieDetailsComponent} from "./movie/movie-details/movie-details.component";
import {MovieUploadComponent} from "./movie/movie-upload/movie-upload.component";

export const routes: Routes = [
  {path:'', component:HomeComponent},
  {path:'details/:_id', component:MovieDetailsComponent},
  {path:'upload', component:MovieUploadComponent}
];
