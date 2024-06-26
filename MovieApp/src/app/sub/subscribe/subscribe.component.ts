import {Component, OnInit} from '@angular/core';
import {MovieService} from "../../movie/movie.service";
import {Genre, Movie} from "../../movie/movie-metadata.model";
import {SubscriptionService} from "../subscription.service";
import {AwsCognitoService} from "../../auth/aws-cognito.service";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent implements OnInit{

  constructor(
    private movieService: MovieService,
    private subscriptionService: SubscriptionService,
    private cognitoService: AwsCognitoService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.movieService.getMoviesMetadata().subscribe((movies) => {
      this.movies = movies;
      this.actors = this.movies.map(movie => movie.actors).flat().filter((actor, index, self) => self.indexOf(actor) === index);
      this.directors = this.movies.map(movie => movie.director).filter((director, index, self) => self.indexOf(director) === index);
      this.genres = Object.values(Genre);
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

  newActor: string = '';
  newDirector: string = '';
  newGenre: string = '';

  filteredActors() {
    return this.actors.filter(actor => actor.toLowerCase().includes(this.actorFilter.toLowerCase()));
  }

  filteredDirectors() {
    return this.directors.filter(director => director.toLowerCase().includes(this.directorFilter.toLowerCase()));
  }

  filteredGenres() {
    return this.genres.filter(genre => genre.toLowerCase().includes(this.genreFilter.toLowerCase()));
  }

  addActor() {
    if (this.newActor && !this.actors.includes(this.newActor)) {
      this.actors.push(this.newActor);
      this.newActor = '';
    }
  }

  addDirector() {
    if (this.newDirector && !this.directors.includes(this.newDirector)) {
      this.directors.push(this.newDirector);
      this.newDirector = '';
    }
  }

  addGenre() {
    if (this.newGenre && !this.genres.includes(this.newGenre)) {
      this.genres.push(this.newGenre);
      this.newGenre = '';
    }
  }

  subscribe() {
    const subscriptions: string[] = this.selectedActors.concat(this.selectedDirectors, this.selectedGenres);
    this.subscriptionService.subscribe(this.cognitoService.getCurrentUserEmail(), subscriptions, this.cognitoService.getCurrentUsername()).subscribe(() => {
      this.toastr.success('Successfully subscribed!');
    }, (error) => {
      console.error(error);
      this.toastr.error('Subscription failed!');
    });
  }



}
