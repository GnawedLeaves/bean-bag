export interface WatchListModel {
  dateAdded: string;
  title: string;
  completed: boolean;
  dateCompleted: string;
  //put user id here
  completedBy: string;
}
// can try calling an api to get movie data
export interface ShowDataModel {}

export interface OmdbRating {
  Source: string;
  Value: string;
}

export interface OmdbDataModel {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: OmdbRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons?: string;
  Response: string;
}
