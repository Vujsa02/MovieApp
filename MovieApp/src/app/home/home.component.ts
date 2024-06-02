import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']  // Corrected to styleUrls
})
export class HomeComponent {
  selectedFile: File | null = null;  // Variable to store the selected file

  constructor(private http: HttpClient) {}

  // Method to handle file selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];  // Store the selected file
  }

  // Method to download a movie
  downloadMovie() {
    let file: string = "mudo";
    return this.http.get("arn:aws:execute-api:eu-central-1:381492024366:65g3v5nudb/*/GET/download/" + file).subscribe(response => {
      console.log('Download response:', response);
    });
  }

  // Method to upload a movie
  uploadMovie() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);  // Append the selected file to form data

      return this.http.post("arn:aws:execute-api:eu-central-1:381492024366:65g3v5nudb/*/POST/upload", formData).subscribe(response => {
        console.log('Upload response:', response);
      });
    } else {
      console.error('No file selected');
      return null;
    }
  }
}
