import { Component } from '@angular/core';
import {Movie} from "../movie-metadata.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MovieService} from "../movie.service";

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent {
  movie!: Movie;

  constructor(private movieService: MovieService,
              private router: Router,
              private route: ActivatedRoute,) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = +params['_id'] + '';
      this.movieService.getMoviesMetadataById(id).subscribe({
        next: (data: Movie)=>{
          this.movie = data;
          console.log(this.movie);
        },
      error: (_) => {
        console.log("Greska!");
      }

      })
    });
  }
}
