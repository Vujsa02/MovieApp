// movie-list.component.ts
import { Component, OnInit } from '@angular/core';
import {MovieService} from "../movie.service";
import {Genre, Movie} from "../movie-metadata.model";


@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  searchCriteria = {
    title: '',
    description: '',
    actor: '',
    director: '',
    genre: ''
  };

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.fetchMovies();
  }

  fetchMovies() {
    this.movieService.getMoviesMetadata().subscribe((movies) => {
      this.movies = movies;
    });
  }

  searchMovies() {
    // this.fetchMovies();
    // this.filteredMovies = this.movies.filter(movie =>
    //   (this.searchCriteria.title ? movie.title.toLowerCase().includes(this.searchCriteria.title.toLowerCase()) : true) &&
    //   (this.searchCriteria.description ? movie.description.toLowerCase().includes(this.searchCriteria.description.toLowerCase()) : true) &&
    //   (this.searchCriteria.actor ? movie.actors.some(actor => actor.toLowerCase().includes(this.searchCriteria.actor.toLowerCase())) : true) &&
    //   (this.searchCriteria.director ? movie.director.toLowerCase().includes(this.searchCriteria.director.toLowerCase()) : true)
    //   //(this.searchCriteria.genre ? movie.genre.toLowerCase().includes(this.searchCriteria.genre.toLowerCase()) : true)
    // );
    // this.movies = this.filteredMovies;
    console.log(this.searchCriteria);
    this.movieService.searchMovies(this.searchCriteria).subscribe((filteredMovies) => {
      this.movies = filteredMovies;})
  }
}
