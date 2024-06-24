import { Component } from '@angular/core';
import {Movie} from "../movie-metadata.model";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent {
  movie!: Movie;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.movie = navigation.extras.state['movie'];
      alert(this.movie);
    } else {
      // Handle the case where movie is not available in the state
      console.error('No movie data available in state');
    }
  }
}
