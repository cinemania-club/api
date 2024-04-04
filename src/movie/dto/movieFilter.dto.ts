export class MovieFilterDto {
  minRuntime: number;
  maxRuntime: number;

  minReleaseDate: string;
  maxReleaseDate: string;

  genres: number[];
  requiredGenres: number[];
}
