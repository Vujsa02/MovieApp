import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  constructor(private http: HttpClient) {}

  // Method to get presigned URL and upload a movie
  uploadMovie(title: string, description: string, fileName: string, fileContent: string): Observable<any> {
    const payload = {
      title,
      description,
      fileName
    };

    return this.http.post<any>('https://p3k848i9ad.execute-api.eu-central-1.amazonaws.com/prod/movies', payload).pipe(
      switchMap(response => {
        const presignedUrl = response.presignedUrl;

        // Convert base64 string to Blob
        const byteCharacters = atob(fileContent.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'video/mp4' });

        // Upload the file to S3 using the presigned URL
        return this.http.put(presignedUrl, blob, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
      })
    );
  }
}
