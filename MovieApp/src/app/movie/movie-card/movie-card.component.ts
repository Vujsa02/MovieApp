import {Component, Input, Output} from '@angular/core';
import {MovieCard} from "./movie-card.model";
import EventEmitter from "node:events";
import {MatCard} from "@angular/material/card";
import {MovieService} from "../movie.service";
import {Movie} from "../movie-metadata.model";
import {Router} from "@angular/router";

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

  downloadMovie() {
    // Implement your download logic here
    console.log(`Downloading movie: ${this.card.title}`);
    this.movieService.getPresignedUrl(this.card.movieId).subscribe(response => {
      const presignedUrl = response.presigned_url;
      window.open(presignedUrl, '_blank');
    }, error => {
      console.error('Error getting presigned URL', error);
      alert('Failed to get presigned URL');
    });
  }

  openDetailsWindow(){
    this.router.navigate(['/details', this.card.movieId], { state: { movie: this.card } });

  }
}
