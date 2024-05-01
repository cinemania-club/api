import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { BaseProcessor } from "../processor";
import { ScrapperService } from "./scrapper.service";

@Processor("tmdb")
export class TmdbProcessor extends BaseProcessor {
  constructor(private scrapperService: ScrapperService) {
    super();
  }

  @Process("getPopular")
  async getPopular(job: Job<{ page: number }>) {
    const { page } = job.data;
    console.info(`[Scrapper] Start processing popular movies. Page: ${page}`);

    const movies = await this.scrapperService.getPopular(page);

    console.info(
      `[Scrapper] Finish processing popular movies. Page: ${movies.page}/${movies.total_pages}`,
    );
  }

  @Process("getMovieDetails")
  async getMovieDetails(job: Job<{ id: number }>) {
    const { id } = job.data;
    console.info(`[Scrapper] Start processing movie with id ${id}`);

    await this.scrapperService.getMovieDetails(id);

    console.info(`[Scrapper] Finish processing movie with id ${id}`);
  }

  @Process("getSeriesDetails")
  async getSeriesDetails(job: Job<{ id: number }>) {
    const { id } = job.data;
    console.info(`[Scrapper] Start processing series with id ${id}`);

    await this.scrapperService.getSeriesDetails(id);

    console.info(`[Scrapper] Finish processing series with id ${id}`);
  }
}
