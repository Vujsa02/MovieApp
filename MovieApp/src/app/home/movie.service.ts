import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor(
    private http: HttpClient
  ) { }

  // Method to upload a movie
  uploadMovie(title: string, description: string, fileName: string, fileContent: string) {
    const payload = {
      title,
      description,
      fileName,
      fileContent
    };

    return this.http.post<any>('https://p3k848i9ad.execute-api.eu-central-1.amazonaws.com/prod/movies', payload);
  }
}


//
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class MovieService {
//
//   constructor(
//     private http: HttpClient
//   ) { }
//
//   // Method to upload a movie
//   uploadMovie(title: string, description: string, fileName: string, fileContent: string) {
//     const payload = {
//       title,
//       description,
//       fileName,
//       fileContent
//     };
//
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': 'http://localhost:4200'  // Add the necessary CORS header
//     });
//
//     return this.http.post<any>('https://iufp0otria.execute-api.eu-central-1.amazonaws.com/prod/movies', payload, { headers });
//   }
// }
