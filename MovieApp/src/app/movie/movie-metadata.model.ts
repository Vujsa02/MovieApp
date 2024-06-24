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
}

export enum Genre{
  ACTION= "Action",
  SCIFI = "Sci-fi",
  ROMANCE = "Romance",
  HORROR = "Horror",
  THRILLER = "Thriller",
  DRAMA = "Drama",
  COMEDY = "Comedy",
  MYSTERY = "Mystery",
}
