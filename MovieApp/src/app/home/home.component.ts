import { Component } from '@angular/core';
import { MovieService } from '../movie/movie.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']  // Corrected to styleUrls
})
export class HomeComponent {

  constructor(private service: MovieService, private router: Router) {}

  openUploadWindow(){
    this.router.navigate(["upload"])
  }

}
