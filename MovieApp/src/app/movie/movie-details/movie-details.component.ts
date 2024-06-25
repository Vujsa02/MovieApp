import {ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Movie} from "../movie-metadata.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MovieService} from "../movie.service";
import {CommonModule, NgIf, NgOptimizedImage} from "@angular/common";
import {env} from "process";
import {environment} from "../../../environment";

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    NgOptimizedImage
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent {
  @Input() movie: Movie | undefined;
  @ViewChild('videoPlayer') videoPlayer: ElementRef | undefined;
  constructor(private movieService: MovieService,
              private router: Router,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const movieId = params['movieId'];
      const createdAt = params['createdAt'];
      this.movieService.getMoviesMetadataById(movieId, createdAt).subscribe({
        next: (data: any)=>{
          this.movie = data[0];
          console.log(this.movie);
          this.cdr.detectChanges();
        },
      error: (err) => {
        console.log(err);
      }

      })
    });
  }


  getImageSrc(): string {
    return this.movie?.image ?  this.movie.image : environment.defaultImage;
  }

   getRoundedDuration(): number {
    return this.movie ? Math.ceil(Number(this.movie.duration)) : 0;
  }

  watchVideo() {
    if (this.movie) {
      this.movieService.getMovieStreamUrl(this.movie.movieId).subscribe({
        next: (data: any) => {
          const videoUrl = data.presignedUrl; // Assuming the API returns the streaming URL
          console.log(videoUrl)
          if (this.videoPlayer && this.videoPlayer.nativeElement) {
            this.videoPlayer.nativeElement.src = videoUrl;
            this.videoPlayer.nativeElement.play();
          }
        },
        error: (_) => {
          console.log("Error fetching video stream URL!");
        }
      });
    }
  }
}
