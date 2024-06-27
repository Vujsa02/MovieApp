import {ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Movie} from "../movie-metadata.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MovieService} from "../movie.service";
import {CommonModule, NgIf, NgOptimizedImage} from "@angular/common";
import {env} from "process";
import {environment} from "../../../environment";
import { ToastrService } from 'ngx-toastr';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDeleteDialogComponent} from "../../dialogs/confirm-delete-dialog/confirm-delete-dialog.component";
import {ReviewDialogComponent} from "../../dialogs/review-dialog/review-dialog.component";
import {MovieCardComponent} from "../movie-card/movie-card.component";
import {MatCard} from "@angular/material/card";
@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    NgOptimizedImage,
    MovieCardComponent,
    MatCard
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent {
  @Input() movie: Movie | undefined;
  episodes: Movie[] = [];
  currentEpisode: Movie | undefined;
  @ViewChild('videoPlayer') videoPlayer: ElementRef | undefined;
  constructor(private movieService: MovieService,
              private router: Router,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private toastr: ToastrService,
              public dialog: MatDialog) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const movieId = params['movieId'];
      const createdAt = params['createdAt'];
      this.movieService.getMoviesMetadataById(movieId, createdAt).subscribe({
        next: (data: any)=>{
          this.movie = data[0];
          console.log(this.movie);
          if (this.movie){
            if(this.movie.fileName == ""){


              this.movieService.getSeriesEpisodesById(this.movie.movieId).subscribe({
                next: (data: any)=>{
                  this.episodes = data.sort((a: any, b: any) => a.episodeNumber - b.episodeNumber);
                  let minEpisode = this.episodes[0];
                  for (let episode of this.episodes){
                    if(episode.episodeNumber < minEpisode.episodeNumber){
                      minEpisode = episode;
                    }
                  }
                  this.currentEpisode = minEpisode;
                }});


            }
          }
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

   getRoundedDuration(movie:Movie): number {
    return movie ? Math.ceil(Number(movie.duration)) : 1;
  }

  watchVideo() {
    if (this.currentEpisode) {
      this.movieService.getMovieStreamUrl(this.currentEpisode.movieId).subscribe({
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
    }else if(this.movie){
      this.movieService.getMovieStreamUrl(this.movie!.movieId).subscribe({
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

    downloadMovie() {
    // add actors, director and genre to the movieInfo array
    const movieInfo: string[] = [];
    for (const actor of this.movie!.actors) {
      movieInfo.push(actor);
    }
    movieInfo.push(this.movie!.director);
    for (const genre of this.movie!.genre) {
      movieInfo.push(genre);
    }

    // Implement your download logic here
    this.movieService.getPresignedUrl(this.movie!.movieId, movieInfo).subscribe(response => {
      const presignedUrl = response.presigned_url;
      window.open(presignedUrl, '_blank');
    }, error => {
      console.error('Error getting presigned URL', error);
      alert('Failed to get presigned URL');
    });
  }

  updateMovie(){
    this.router.navigate(["/update/movie/" + this.movie!.movieId + "/" + this.movie!.createdAt])
  }
  deleteMovie() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { movie: this.movie },
    });

    // Handle dialog close
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.movieService.deleteMovie(this.movie!.movieId, this.movie!.createdAt).subscribe(
          response => {
            this.toastr.success('Successfully deleted movie', 'Success', {
              timeOut: 5000
            });
            this.router.navigate(['/home']);
          },
          error => {
            this.toastr.error('Error deleting movie', 'Error');
            console.log(error);
          }
        );
      }
    });
  }

  openReviewDialog(): void {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) {
      console.log('Dialog closed without action (cancel button)');
      // Handle cancellation logic if needed
    } else {
      console.log('Dialog closed with result: ', result);
      let movie_param = []
      movie_param.push(this.movie?.director)
      let combinedArray = movie_param.concat(this.movie?.actors);
      let movie_param2 = combinedArray.concat(this.movie?.genre)
      let searchCriteria = {
          rating: result,
          movie_param: movie_param2
          //Add params if necessary(also need to change lambda)
        };
      this.movieService.createMovieReview(searchCriteria).subscribe({
        next: (data: any) => {
          console.log(data);
        }});
    }
    });
  }

  openUploadEpisode(){
    this.router.navigate([`/upload/episode/${this.movie?.movieId}/${this.movie?.createdAt}`])
  }

  onEpisodeChosen(episode: Movie) {
    this.currentEpisode = episode;
    this.watchVideo();
  }

  chooseEpisode(episode: Movie){
    this.currentEpisode = episode;
    this.watchVideo();
  }

  editEpisode(episode: Movie){
    this.router.navigate([`update/episode/${episode?.movieId}/${episode?.createdAt}`])
  }
  protected readonly open = open;
}
