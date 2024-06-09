import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MovieService} from "./movie.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']  // Corrected to styleUrls
})
export class HomeComponent {
  selectedFile: File | null = null;  // Variable to store the selected file

  constructor(
    private service: MovieService  // Inject the service
  ) {}

  // Method to handle file selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];  // Store the selected file
  }

  // Method to download a movie
  downloadMovie() {
  }

  // Method to upload a movie
  uploadMovie() {
    if (this.selectedFile) {
      // convert movie to base64
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        const fileContent = reader.result;
        if (fileContent && typeof fileContent === 'string') {
          this.service.uploadMovie('Movie Title', 'Movie Description', this.selectedFile?.name || 'filmic', fileContent).subscribe(() => {
            alert('Movie uploaded successfully');
          });
        }

      };
    }
  }

}
