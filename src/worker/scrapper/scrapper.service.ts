import { Injectable } from "@nestjs/common";
import { MovieRepository } from "./movie.repository";
import { TmdbAdapter } from "./tmdb.adapter";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    private movieRepository: MovieRepository,
  ) {}

  async getChanges(date: Date, page: number) {
    const changes = await this.tmdbAdapter.getChanges(date, page);
    await this.movieRepository.saveChanges(changes.results);
    return changes;
  }

  async getMovieDetails(id: number) {
    const movie = await this.tmdbAdapter.getMovieDetails(id);
    await this.movieRepository.saveMovie(movie);
  }
}
