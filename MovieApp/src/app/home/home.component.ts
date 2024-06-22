import { Component } from '@angular/core';
import { MovieService } from '../movie/movie.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']  // Corrected to styleUrls
})
export class HomeComponent {
  selectedFile: File | null = null;  // Variable to store the selected file

  constructor(private service: MovieService) {}

  // Method to handle file selection
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      this.selectedFile = file;
      console.log(`Selected file: ${file.name}`);
    }
  }

  // Method to upload a movie
  uploadMovie() {
    if (this.selectedFile) {
      // convert movie to base64
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        const fileContent = reader.result as string;
        if (fileContent) {
          this.service.uploadMovie('Movie Title', 'Movie Description', this.selectedFile?.name || 'filmic', fileContent)
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

  fetchMoviesMetadata() {
    this.service.getMoviesMetadata().subscribe(movies => {
      console.log('Movies metadata:', movies);
    }, error => {
      console.error('Error fetching movies metadata', error);
      alert('Failed to fetch movies metadata');
    });
  }
}
