import { Component } from '@angular/core';
import {Genre, Movie} from "../../movie/movie-metadata.model";
import {MovieService} from "../../movie/movie.service";
import {ToastrService} from "ngx-toastr";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {Router} from "@angular/router";
import {LayoutModule} from "../../layout/layout.module";

@Component({
  selector: 'app-series-upload',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    LayoutModule
  ],
  templateUrl: './series-upload.component.html',
  styleUrl: './series-upload.component.css'
})
export class SeriesUploadComponent {
  selectedImageFile: File | null = null; // Variable to store the selected image file
  selectedGenres: Genre[] = []; // Array to store selected genres as Genre enum values
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
    episodeNumber: 0,
    seriesId: ''
  };

  constructor(private movieService: MovieService, private toastr: ToastrService, private router: Router) { }

  ngOnInit() {
    this.genres = Object.values(Genre);
  }

  onSubmit() {
    // Convert actors from comma separated string to array
    this.movie.actors = this.movie.actors.toString().split(',').map(actor => actor.trim());

    // Convert selectedGenres from strings to Genre enum values
    this.uploadMovieGenre();

    // Call service to upload movie metadata
    this.sendUploadRequest();
  }




  onImageFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      this.selectedImageFile = file;
      console.log(`Selected image file: ${file.name}`);
    }
  }


  sendUploadRequest() {
    if (this.selectedGenres.length > 0) {
        if (this.selectedImageFile) {
          const imageReader = new FileReader();
          imageReader.readAsDataURL(this.selectedImageFile!);
          imageReader.onload = () => {
            const imageContent = imageReader.result as string;

            if (imageContent) {
              this.movie.image = imageContent; // Set the base64 string of the image to movie.image
              this.movieService.uploadMovie(this.movie, "")
                .subscribe(() => {
                 this.toastr.success('Series uploaded successfully', 'Success', {
                    timeOut: 5000
                  });
                 this.router.navigate(["/home"]);

                }, error => {
                  this.toastr.error('Error uploading', 'Error', {
                     timeOut: 5000
                   });
                });
            }
          };
        } else {
          this.movieService.uploadMovie(this.movie, "")
            .subscribe(() => {
              this.toastr.success('Series uploaded successfully', 'Success', {
              timeOut: 5000
            });
              this.router.navigate(["/home"]);
            }, error => {
               console.log(error);
               this.toastr.error('Error uploading', 'Error', {
                 timeOut: 5000
               });
            });
        }

    }else{
       this.toastr.error('Invalid form', 'Error', {
       timeOut: 5000
       });
    }
  }

  // Function to update movie.genre from selectedGenres array
  uploadMovieGenre() {
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

}
