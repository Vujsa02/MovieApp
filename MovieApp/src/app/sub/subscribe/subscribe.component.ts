import {Component, OnInit} from '@angular/core';
import {MovieService} from "../movie/movie.service";
import {Movie} from "../movie/movie-metadata.model";


@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent implements OnInit{

  constructor(
    private movieService: MovieService
  ) {}

  ngOnInit() {
    this.movieService.getMoviesMetadata().subscribe((movies) => {
      this.movies = movies;
      this.actors = this.movies.map(movie => movie.actors).flat().filter((actor, index, self) => self.indexOf(actor) === index);
      this.directors = this.movies.map(movie => movie.director).filter((director, index, self) => self.indexOf(director) === index);
      this.genres = this.movies.map(movie => movie.genre).flat().filter((genre, index, self) => self.indexOf(genre) === index);
    });
  }

  movies: Movie[] = [];

  actors: string[] = [];
  directors: string[] = [];
  genres: string[] = [];

  selectedActors = [];
  selectedDirectors = [];
  selectedGenres = [];

  actorFilter = '';
  directorFilter = '';
  genreFilter = '';

  filteredActors() {
    return this.actors.filter(actor => actor.toLowerCase().includes(this.actorFilter.toLowerCase()));
  }

  filteredDirectors() {
    return this.directors.filter(director => director.toLowerCase().includes(this.directorFilter.toLowerCase()));
  }

  filteredGenres() {
    return this.genres.filter(genre => genre.toLowerCase().includes(this.genreFilter.toLowerCase()));
  }


  subscribe() {
    console.log('Selected Actors:', this.selectedActors);
    console.log('Selected Directors:', this.selectedDirectors);
    console.log('Selected Genres:', this.selectedGenres);
    // Ovde možete dodati logiku za slanje notifikacija ili čuvanje podataka
  }
}
