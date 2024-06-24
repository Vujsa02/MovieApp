import {Component, OnInit} from '@angular/core';
import {MovieService} from "../movie.service";
import {FormsModule} from "@angular/forms";
import {Genre, Movie} from "../movie-metadata.model";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-movie-upload',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './movie-upload.component.html',
  styleUrl: './movie-upload.component.css'
})
export class MovieUploadComponent implements OnInit{
  selectedFile: File | null = null;  // Variable to store the selected file
  selectedImageFile: File | null = null;  // Variable to store the selected image file

  genres: string[] = [];

   movie: Movie = {
      movieId: '',
      title: '',
      description: '',
      fileName: '',
      actors: [],
      movie_size: 0,
      genre: Genre.ACTION,
      duration: 0,
      director: '',
      createdAt: '',
      updatedAt: '',
      image: '',
    };


  constructor(private movieService: MovieService) { }
  ngOnInit() {
      this.genres = Object.values(Genre);
  }
  onSubmit() {
    // Convert actors from comma separated string to array
    this.movie.actors = this.movie.actors.toString().split(',').map(actor => actor.trim());

    // Call service to upload movie metadata
    this.sendUploadRequest();
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      this.selectedFile = file;
      this.movie.fileName = file.name;
      this.movie.movie_size = file.size / (1024 * 1024); // Convert size to MB
      this.getMovieDuration(file).then(duration => {
        this.movie.duration = duration;
        console.log(`Selected file: ${file.name}, Duration: ${duration} seconds`);
      });
    }
  }

 onImageFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      this.selectedImageFile = file;
      console.log(`Selected image file: ${file.name}`);
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

        if (this.selectedImageFile){
          const imageReader = new FileReader();
        imageReader.readAsDataURL(this.selectedImageFile!);
        imageReader.onload = () => {
          const imageContent = imageReader.result as string;

          if (movieContent && imageContent) {
            this.movie.image = imageContent; // Set the base64 string of the image to movie.image
            this.movieService.uploadMovie(this.movie, movieContent)
              .subscribe(() => {
                alert('Movie uploaded successfully');
              }, error => {
                console.error('Error uploading movie', error);
                alert('Failed to upload movie');
              });
            }
          };
        }else{
          this.movieService.uploadMovie(this.movie, movieContent)
              .subscribe(() => {
                alert('Movie uploaded successfully');
              }, error => {
                console.error('Error uploading movie', error);
                alert('Failed to upload movie');
              });
        }
      };
    }
  }

}
