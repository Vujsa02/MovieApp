import {ChangeDetectorRef, Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {Genre, Movie} from "../../movie/movie-metadata.model";
import {MovieService} from "../../movie/movie.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ConfirmDeleteDialogComponent} from "../../dialogs/confirm-delete-dialog/confirm-delete-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-episode-update',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    MatIconModule
  ],
  templateUrl: './episode-update.component.html',
  styleUrl: './episode-update.component.css'
})
export class EpisodeUpdateComponent {
  selectedFile: File | null = null; // Variable to store the selected file
  genres: string[] = [];
  formattedDuration: string = '';

  movie: Movie = {
    movieId: '',
    title: '',
    description: '',
    fileName: '',
    actors: [],
    movie_size: 0,
    genre: [],
    duration: 0,
    director: '',
    createdAt: '',
    updatedAt: '',
    image: '',
    seriesId: '',
    episodeNumber: 0
  };

  constructor(private movieService: MovieService,
              private router: Router,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private toastr: ToastrService,
              public dialog: MatDialog) {
  }


  ngOnInit() {
    this.genres = Object.values(Genre);
    this.route.params.subscribe((params) => {
      const movieId = params['movieId'];
      const createdAt = params['createdAt'];
      this.movieService.getMoviesMetadataById(movieId, createdAt).subscribe({
        next: (data: any) => {
          this.movie = data[0];
          console.log(this.movie);
          this.formattedDuration = this.formatDuration(this.movie.duration);
          this.setGenreSelections();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        }

      })
    });
  }

  onSubmit() {
    // Convert actors from comma separated string to array
    this.movie.actors = this.movie.actors.toString().toLowerCase().split(',').map(actor => actor.trim());

    this.sendUpdateRequest();
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      this.selectedFile = file;
      this.movie.fileName = file.name;
      this.movie.movie_size = parseFloat((file.size / (1024 * 1024)).toFixed(1)); // Convert size to MB
      this.getMovieDuration(file).then(duration => {
        this.movie.duration = duration;
        this.formattedDuration = this.formatDuration(duration);
        console.log(`Selected file: ${file.name}, Duration: ${duration} seconds`);
      });
    }
  }


  getMovieDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        const durationInMinutes = videoElement.duration / 60;
        resolve(durationInMinutes);
      };

      videoElement.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      videoElement.src = URL.createObjectURL(file);
    });
  }

  sendUpdateRequest() {
    if (this.selectedFile) {
      // convert movie to base64
      const movieReader = new FileReader();
      movieReader.readAsDataURL(this.selectedFile);
      movieReader.onload = () => {
        const movieContent = movieReader.result as string;
        if (movieContent ) {
          this.movieService.updateMovie(this.movie, movieContent)
            .subscribe(() => {
              this.toastr.success('Movie updated successfully', 'Success', {
                  timeOut: 5000
                });
              this.router.navigate(["/home"]);
            }, error => {
              if (error.status === 400) {
              this.toastr.error('Invalid episode number', 'Error', {
                timeOut: 5000,
              });
            }else{
                console.log(error);
              this.toastr.error('Error updating', 'Error', {
                 timeOut: 5000
               });
              }
            });
        }
      };
    } else {
        this.movieService.updateMovie(this.movie, '')
          .subscribe(() => {
            this.toastr.success('Movie updated successfully', 'Success', {
                timeOut: 5000
              });
            this.router.navigate(["/home"]);
          }, error => {
            if (error.status === 400) {
              this.toastr.error('Invalid episode number', 'Error', {
                timeOut: 5000,
              });
            }else{
               this.toastr.error('Error updating', 'Error', {
               timeOut: 5000
                });
            }
          });
    }
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
            this.toastr.success('Successfully deleted episode', 'Success', {
              timeOut: 5000
            });
            this.router.navigate(['/home']);
          },
          error => {
            this.toastr.error('Error deleting episode', 'Error');
            console.log(error);
          }
        );
      }
    });
  }

  formatDuration(duration: number): string {
    const hours = Math.floor(duration / 60);
    const minutes = Math.floor(duration % 60);
    const seconds = Math.floor((duration * 60) % 60);

    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  // Helper method to pad single digit numbers with a leading zero
  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

   setGenreSelections() {
    const genreCheckboxes = document.querySelectorAll('input[type="checkbox"][name="genre"]');
    genreCheckboxes.forEach(checkbox => {
      const genre = (checkbox as HTMLInputElement).value;
      const genreValue = Object.values(Genre).find(g => g === genre);
      if(this.movie.genre.includes(genreValue!)){
        (checkbox as HTMLInputElement).checked = true;
        }
    });
  }


}

