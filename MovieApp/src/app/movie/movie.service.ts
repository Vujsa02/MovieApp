import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of, forkJoin} from 'rxjs';
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

  // Method to upload a movie with optional file content
  uploadMovie(movie: Movie, fileContent: string): Observable<any> {
  let payload = this.createPayload(movie, fileContent);

  return this.http.post<any>(`${environment.apiGatewayHost}/movies`, payload).pipe(
    switchMap(response => {
      const presignedUrl = response.presignedUrl;
      const movieId = response.movieId;
      if (presignedUrl) {
        const byteArray = this.base64ToArrayBuffer(fileContent);
        const blob = new Blob([byteArray], { type: 'video/mp4' });

        // Upload the file to S3 using the presigned URL
        return this.http.put(presignedUrl, blob, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }).pipe(
          switchMap(() => {
            // Call the Lambda function to get 3 presigned URLs and byte arrays for different resolutions
            const transcodePayload = {
              movie_id: movieId,
              file_content_base64: fileContent  // Base64 encoded file content
            };

            return this.http.post<any>(`${environment.transcodeUrl}`, transcodePayload
          ).pipe(
              switchMap(transcodeResponse => {
                return of({ message: 'Transcoding job completed successfully' });
              })
            );
          })
        );
      } else {
        return of({ message: 'Update successful without file upload' });
      }
    })
  );
}

  // Method to update a movie with optional file content
  updateMovie(movie: Movie, fileContent: string): Observable<any> {
    let payload = this.createPayload(movie, fileContent);

    return this.http.put<any>(environment.apiGatewayHost + `movies/${movie.movieId}?createdAt=${movie.createdAt}`, payload).pipe(
      switchMap(response => {
        const presignedUrl = response.presignedUrl;
        if (presignedUrl) {
          const byteArray = this.base64ToArrayBuffer(fileContent);
          const blob = new Blob([byteArray], { type: 'video/mp4' });

          // Upload the file to S3 using the presigned URL
          return this.http.put(presignedUrl, blob, {
            headers: {
              'Content-Type': 'application/octet-stream'
            }
          }).pipe(
          switchMap(() => {
            // Call the Lambda function to get 3 presigned URLs and byte arrays for different resolutions
            const transcodePayload = {
              movie_id: movie.movieId,
              file_content_base64: fileContent  // Base64 encoded file content
            };

            return this.http.post<any>(`${environment.transcodeUrl}`, transcodePayload
          ).pipe(
              switchMap(transcodeResponse => {
                return of({ message: 'Transcoding job completed successfully' });
              })
            );
          })
        );;
        } else {
          // If presignedUrl is empty, update episodes if fileName is empty
          if (movie.fileName === "") {
            return this.getSeriesEpisodesById(movie.movieId).pipe(
              switchMap((episodes: any[]) => {
                let episodeUpdates = episodes.map(episode => {
                  return this.updateEpisode(episode, movie);
                });
                // Execute all updates and return result
                return forkJoin(episodeUpdates);
              })
            );
          } else {
            return of({ message: 'Update successful without file upload' });
          }
        }
      })
    );
  }

  // Method to update an episode
  private updateEpisode(episode: any, movie: Movie): Observable<any> {
    let payload = this.createPayload(episode, "");
    payload.actors = movie.actors
    payload.genre = movie.genre
    payload.director = movie.director
    payload.image = movie.image
    return this.http.put<any>(environment.apiGatewayHost + `movies/${episode.movieId}?createdAt=${episode.createdAt}`, payload).pipe(
      switchMap(response => {
        return of({ message: 'Episode update successful' });
      })
    );
  }

  // Method to create payload for upload/update
  private createPayload(movie: Movie, fileContent: string): any {
    return {
      title: movie.title.toLowerCase(),
      description: movie.description.toLowerCase(),
      fileName: movie.fileName,
      actors: movie.actors,
      movie_size: new Decimal(movie.movie_size).toString(),
      genre: movie.genre,
      duration: new Decimal(movie.duration).toString(),
      director: movie.director.toLowerCase(),
      image: movie.image,
      content: fileContent ? "Exists" : "",
      episodeNumber: new Decimal(movie.episodeNumber).toString(),
      seriesId: movie.seriesId || "None"
    };
  }

  // Method to convert base64 string to ArrayBuffer
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  }

  // Method to get presigned URL and download a movie
  getPresignedUrl(movieId: string, movieInfo: string[]): Observable<any> {
    let params = new HttpParams();
    params = params.append('info', JSON.stringify(movieInfo));
    params = params.append('username', this.cognitoService.getCurrentUsername());

    return this.http.get<any>(environment.apiGatewayHost + `movies/download/${movieId}`, { params });
  }

  // Method to fetch all movies metadata
  getMoviesMetadata(username: string = ''): Observable<any> {
    let params = new HttpParams();
    params = params.append('username', username);
    return this.http.get<any>(environment.apiGatewayHost + 'movies', { params });
  }

  // Method to fetch movie metadata by ID and createdAt
  getMoviesMetadataById(movieId: string, createdAt: string): Observable<any> {
    return this.http.get<any>(environment.apiGatewayHost + `movies/${movieId}?createdAt=${createdAt}`);
  }

  // Method to fetch movie streaming URL
  getMovieStreamUrl(movieId: string, resolution: string): Observable<any> {
    return this.http.get<any>(environment.apiGatewayHost + `movies/stream/${movieId}?resolution=${resolution}`);
  }

  // Method to search movies based on criteria
  searchMovies(criteria: object): Observable<any> {
    return this.http.post<any>(environment.apiGatewayHost + `search`, criteria);
  }

  // Method to delete a movie by ID and createdAt
  deleteMovie(movieId: string, createdAt: string): Observable<any> {
    return this.http.delete<any>(environment.apiGatewayHost + `movies/${movieId}?createdAt=${createdAt}`);
  }

  // Method to fetch episodes of a series by movieId
  getSeriesEpisodesById(movieId: string): Observable<any> {
    return this.http.get<any>(environment.apiGatewayHost + `episodes/${movieId}`);
  }

  createMovieReview(review: object):Observable<any>{
    let params = new HttpParams();
    params = params.append('username', this.cognitoService.getCurrentUsername());
    return this.http.post<any>(environment.apiGatewayHost + `reviews`, review, {params});
  }

  addUserToGroup(username: string, groupName: string) {
    const payload = { userName: username, group_name: groupName, poolId: environment.userPoolId};
    this.http.post(environment.apiGatewayHost + '/user-group', payload)
      .subscribe(response => {
        console.log('User added to group successfully');
      }, error => {
        console.error('Failed to add user to group', error);
      });
  }


}
