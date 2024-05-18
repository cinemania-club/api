import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { Job, Queue } from "bull";
import { BaseProcessor } from "../processor";
import { ScrapperService } from "./scrapper.service";

@Processor("tmdb")
export class TmdbProcessor extends BaseProcessor {
  constructor(
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private scrapperService: ScrapperService,
  ) {
    super();
  }

  @Process("getPopularMovies")
  async getPopularMovies(job: Job<{ page: number }>) {
    await this.scrapperService.getPopularMovies(job.data.page);
  }

  @Process("getMovieDetails")
  async getMovieDetails(job: Job<{ id: number }>) {
    await this.scrapperService.getMovieDetails(job.data.id);
  }

  @Process("getPopularSeries")
  async getPopularSeries(job: Job<{ page: number }>) {
    await this.scrapperService.getPopularSeries(job.data.page);
  }

  @Process("getSeriesDetails")
  async getSeriesDetails(job: Job<{ id: number }>) {
    await this.scrapperService.getSeriesDetails(job.data.id);
  }

  async enqueuePopularMovies(pages: number[]) {
    const jobs = pages.map((page) => ({
      name: "getPopularMovies",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }
}
