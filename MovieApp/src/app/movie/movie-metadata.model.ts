export interface Movie{
  movieId: string;
  title: string;
  description: string;
  fileName: string;
  actors: string[];
  movie_size: number;
  genre: Genre[];
  duration: number;
  director: string;
  createdAt: string;
  updatedAt: string;
  image: string;
  episodeNumber: number;
  seriesId: string;
}

export enum Genre{
  ACTION= "action",
  SCIFI = "sci-fi",
  ROMANCE = "romance",
  HORROR = "horror",
  THRILLER = "thriller",
  DRAMA = "drama",
  COMEDY = "comedy",
  MYSTERY = "mystery",
}
