import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { MovieRepository } from "./movie.repository";
import { TmdbAdapter } from "./tmdb.adapter";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    private movieRepository: MovieRepository,
    @InjectQueue("tmdb") private tmdbQueue: Queue,
  ) {}

  async getChanges(date: Date, page: number) {
    const changes = await this.tmdbAdapter.getChanges(date, page);

    const jobs = changes.results.map((movie) => ({
      name: "getMovieDetails",
      data: { id: movie.id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (changes.page < changes.total_pages) {
      this.tmdbQueue.add("getChanges", { date, page: changes.page + 1 });
    }

    return changes;
  }

  async getMovieDetails(id: number) {
    const movie = await this.tmdbAdapter.getMovieDetails(id);
    await this.movieRepository.saveMovie(movie);
  }
}
