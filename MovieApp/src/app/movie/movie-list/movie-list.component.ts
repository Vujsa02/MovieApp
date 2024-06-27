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
    actors: '',
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
    //this.criteriaToLowerCase()
    console.log(this.searchCriteria);
    this.movieService.searchMovies(this.searchCriteria).subscribe((filteredMovies) => {
      this.movies = filteredMovies;
      this.filterEpisodes();
    })

  }

  filterEpisodes(){
    let no_episodes_movies : Movie[] = []
    for (let movie of this.movies){
        if (movie.episodeNumber == 0){
          no_episodes_movies.push(movie)
        }
    }
    this.movies = no_episodes_movies
  }

  resetMovies(){
    this.fetchMovies()
  }

  clearForm() {
    this.searchCriteria.title = '';
    this.searchCriteria.description = '';
    this.searchCriteria.actors = '';
    this.searchCriteria.director = '';
    this.searchCriteria.genre = '';
  }

  criteriaToLowerCase(){
    this.searchCriteria.title = this.searchCriteria.title.toLowerCase();
    this.searchCriteria.description = this.searchCriteria.description.toLowerCase();
    this.searchCriteria.actors = this.searchCriteria.actors.toLowerCase();
    this.searchCriteria.director = this.searchCriteria.director.toLowerCase();
    this.searchCriteria.genre = this.searchCriteria.genre.toLowerCase();
  }
}
