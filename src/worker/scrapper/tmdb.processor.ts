import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { BaseProcessor } from "../processor";
import { ScrapperService } from "./scrapper.service";

@Processor("tmdb")
export class TmdbProcessor extends BaseProcessor {
  constructor(private scrapperService: ScrapperService) {
    super();
  }

  @Process("getTopRated")
  async getTopRated(job: Job<{ page: number }>) {
    const { page } = job.data;
    console.info(`[Scrapper] Start processing top rated movies. Page: ${page}`);

    const movies = await this.scrapperService.getTopRated(page);

    console.info(
      `[Scrapper] Finish processing top rated movies. Page: ${movies.page}/${movies.total_pages}`,
    );
  }

  @Process("getChanges")
  async getChanges(job: Job<{ date: Date; page: number }>) {
    const { date, page } = job.data;
    console.info(
      `[Scrapper] Start processing changes for date ${date}, page ${page}`,
    );

    const changes = await this.scrapperService.getChanges(date, page);

    console.info(
      `[Scrapper] Finish processing changes for date ${date}, page ${changes.page}/${changes.total_pages}`,
    );
  }

  @Process("getMovieDetails")
  async getMovieDetails(job: Job<{ id: number }>) {
    const { id } = job.data;
    console.info(`[Scrapper] Start processing movie with id ${id}`);

    await this.scrapperService.getMovieDetails(id);

    console.info(`[Scrapper] Finish processing movie with id ${id}`);
  }
}
