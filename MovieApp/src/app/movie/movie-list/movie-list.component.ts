// movie-list.component.ts
import { Component, OnInit } from '@angular/core';
import {MovieCard} from "../movie-card/movie-card.model";
import {MovieService} from "../movie.service";
import {Movie} from "../movie-metadata.model";


@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.fetchMovies();
  }

  fetchMovies() {
    this.movieService.getMoviesMetadata().subscribe((movies) => {
      this.movies = movies;
    });
  }
}
