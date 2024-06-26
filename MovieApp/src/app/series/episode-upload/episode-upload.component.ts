import {ChangeDetectorRef, Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "../../infrastructure/material/material.module";
import {NgForOf} from "@angular/common";
import {Genre, Movie} from "../../movie/movie-metadata.model";
import {MovieService} from "../../movie/movie.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {LayoutModule} from "../../layout/layout.module";

@Component({
  selector: 'app-episode-upload',
  standalone: true,
  imports: [
    FormsModule,
    MaterialModule,
    NgForOf,
    LayoutModule
  ],
  templateUrl: './episode-upload.component.html',
  styleUrl: './episode-upload.component.css'
})
export class EpisodeUploadComponent {
  selectedFile: File | null = null; // Variable to store the selected file
  selectedImageFile: File | null = null; // Variable to store the selected image file
  selectedGenres: Genre[] = []; // Array to store selected genres as Genre enum values
  genres: string[] = [];
  formattedDuration: string = '';
  genreSelections: { [key: string]: boolean } = {};

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
    episodeNumber: 1
  };

  constructor(private movieService: MovieService,
              private router: Router,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private toastr: ToastrService) {
  }


  ngOnInit() {
    this.genres = Object.values(Genre);
    this.route.params.subscribe((params) => {
      const movieId = params['movieId'];
      const createdAt = params['createdAt'];
      this.movieService.getMoviesMetadataById(movieId, createdAt).subscribe({
        next: (data: any) => {
          this.movie = data[0];
          this.setUploadFields();
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

  setUploadFields(){
    this.movie.seriesId = this.movie.movieId
    this.movie.movieId = ""
    this.movie.title = ""
    this.movie.description = ""
    this.movie.episodeNumber= 1
  }

  onSubmit() {
    // Convert actors from comma separated string to array
    this.movie.actors = this.movie.actors.toString().split(',').map(actor => actor.trim());

    // Convert selectedGenres from strings to Genre enum values
    this.updateMovieGenre();

    // Call service to upload movie metadata
    this.sendUploadRequest();
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

  sendUploadRequest() {
  if (this.selectedFile) {
    // convert movie to base64
    const movieReader = new FileReader();
    movieReader.readAsDataURL(this.selectedFile);
    movieReader.onload = () => {
      const movieContent = movieReader.result as string;
      if (movieContent) {
        this.movieService.uploadMovie(this.movie, movieContent).subscribe(
          () => {
            this.toastr.success('Episode uploaded successfully', 'Success', {
              timeOut: 5000,
            });
            this.router.navigate(['/home']);
          },
          (error) => {
            if (error.status === 400) {
              this.toastr.error('Invalid episode number', 'Error', {
                timeOut: 5000,
              });
            } else {
              this.toastr.error('Error uploading', 'Error', {
                timeOut: 5000,
              });
            }
          }
        );
      }
    };
  } else {
    this.toastr.error('Invalid form', 'Error', {
      timeOut: 5000,
    });
  }
}


  // Function to update movie.genre from selectedGenres array
  updateMovieGenre() {
    const genreCheckboxes = document.querySelectorAll('input[type="checkbox"][name="genre"]');
    this.movie.genre = [];
    genreCheckboxes.forEach(checkbox => {
      if ((checkbox as HTMLInputElement).checked) {
        const genre = (checkbox as HTMLInputElement).value;
        const genreValue = Object.values(Genre).find(g => g === genre);
        this.movie.genre.push(genreValue!);
        this.selectedGenres.push(genreValue!);
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
      if (this.movie.genre.includes(genreValue!)) {
        (checkbox as HTMLInputElement).checked = true;
        this.selectedGenres.push(genreValue!);
      }

    });
  }
}
