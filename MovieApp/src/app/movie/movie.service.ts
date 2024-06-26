import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {Movie} from "./movie-metadata.model";
import Decimal from 'decimal.js';
import {environment} from "../../environment";
import {AwsCognitoService} from "../auth/aws-cognito.service";

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  constructor(private http: HttpClient, private cognitoService: AwsCognitoService) {}

  // Method to get presigned URL and upload a movie
  uploadMovie(movie: Movie, fileContent: string): Observable<any> {
    const payload = {
      title: movie.title,
      description: movie.description,
      fileName: movie.fileName,
      actors: movie.actors,
      movie_size: new Decimal(movie.movie_size).toString(),
      genre: movie.genre,
      duration: new Decimal(movie.duration).toString(),
      director: movie.director,
      image: movie.image
    };

    return this.http.post<any>(environment.apiGatewayHost + 'movies', payload).pipe(
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

  updateMovie(movie: Movie, fileContent: string): Observable<any> {
    let payload = {}
    if (fileContent == ""){
      payload = {
      title: movie.title,
      description: movie.description,
      fileName: movie.fileName,
      actors: movie.actors,
      movie_size: new Decimal(movie.movie_size).toString(),
      genre: movie.genre,
      duration: new Decimal(movie.duration).toString(),
      director: movie.director,
      image: movie.image,
      content: fileContent
      };
    }else{
      payload = {
      title: movie.title,
      description: movie.description,
      fileName: movie.fileName,
      actors: movie.actors,
      movie_size: new Decimal(movie.movie_size).toString(),
      genre: movie.genre,
      duration: new Decimal(movie.duration).toString(),
      director: movie.director,
      image: movie.image,
      };
    }


    return this.http.put<any>(environment.apiGatewayHost +  `movies/${movie.movieId}?createdAt=${movie.createdAt}`, payload).pipe(
      switchMap(response => {
        const presignedUrl = response.presignedUrl;
        if(presignedUrl != ""){
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
        }else{
          return of({ message: 'Update successful without file upload' });
        }
      })
    );
  }

  // Method to get presigned URL and download a movie
  getPresignedUrl(movieId: string, movieInfo: string[]): Observable<any> {
    let params = new HttpParams();
    params = params.append('info', JSON.stringify(movieInfo));
    params = params.append('username', this.cognitoService.getCurrentUsername());

    return this.http.get<any>(environment.apiGatewayHost + `movies/download/${movieId}`, { params });
  }

  // Method to get movie metadata
  getMoviesMetadata(): Observable<any> {
    return this.http.get<any>(environment.apiGatewayHost + 'movies');
  }

  getMoviesMetadataById(movieId: string, createdAt: string): Observable<any> {
    return this.http.get<any>(environment.apiGatewayHost + `movies/${movieId}?createdAt=${createdAt}`);
  }

   getMovieStreamUrl(movieId: string) {
    return this.http.get<any>(environment.apiGatewayHost + `movies/stream/${movieId}`);
  }

  searchMovies(criteria: object): Observable<any>{
    return this.http.post<any>(environment.apiGatewayHost + `search`, criteria);
  }
  deleteMovie(movieId: string, createdAt: string): Observable<any> {
    return this.http.delete<any>(environment.apiGatewayHost + `movies/${movieId}?createdAt=${createdAt}`);
  }

}
