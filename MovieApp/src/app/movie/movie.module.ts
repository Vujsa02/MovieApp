import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MovieListComponent} from "./movie-list/movie-list.component";
import {MovieCardComponent} from "./movie-card/movie-card.component";
import {MovieUploadComponent} from "./movie-upload/movie-upload.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [MovieListComponent],
  imports: [
    CommonModule,
    MovieCardComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MovieListComponent,
  ]
})
export class MovieModule { }
