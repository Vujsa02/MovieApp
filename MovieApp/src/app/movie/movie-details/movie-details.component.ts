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

    downloadMovie() {
    // Implement your download logic here
    this.movieService.getPresignedUrl(this.movie!.movieId).subscribe(response => {
      const presignedUrl = response.presigned_url;
      window.open(presignedUrl, '_blank');
    }, error => {
      console.error('Error getting presigned URL', error);
      alert('Failed to get presigned URL');
    });
  }

  updateMovie(){
    this.router.navigate(["/update/" + this.movie!.movieId + "/" + this.movie!.createdAt])
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
      // Handle submission logic based on result (selectedOption)
    }
    });
  }

  openUploadEpisode(){
    this.router.navigate([`/upload/episode/${this.movie?.movieId}/${this.movie?.createdAt}`])
  }

  protected readonly open = open;
}
