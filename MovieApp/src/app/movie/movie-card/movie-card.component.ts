import {Component, Input, Output} from '@angular/core';
import EventEmitter from "node:events";
import {MatCard} from "@angular/material/card";
import {MovieService} from "../movie.service";
import {Movie} from "../movie-metadata.model";
import {Router} from "@angular/router";
import {environment} from "../../../environment";

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [
    MatCard
  ],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.css'
})
export class MovieCardComponent {
  @Input() card!: Movie;

  constructor(private movieService: MovieService,
              private router: Router) {}



  openDetailsWindow(){
    this.router.navigate(['/details/'+ this.card.movieId + "/" + this.card.createdAt]);
  }

  getImageSrc(): string {
    return this.card?.image ? this.card.image : environment.defaultImage;
  }

}
