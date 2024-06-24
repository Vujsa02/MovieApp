import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieListComponent } from "./movie-list/movie-list.component";
import { MovieCardComponent } from "./movie-card/movie-card.component";
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
  declarations: [MovieListComponent],
  imports: [
    CommonModule,
    MovieCardComponent,
    MatFormFieldModule
  ],
  exports: [
    MovieListComponent,
  ]
})
export class MovieModule { }
