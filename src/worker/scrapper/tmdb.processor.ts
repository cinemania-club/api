import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ScrapperService } from "./scrapper.service";

@Processor("tmdb")
export class TmdbProcessor {
  constructor(private scrapperService: ScrapperService) {}

  @Process("getMovieDetails")
  async getMovieDetails(job: Job<{ id: number }>) {
    const { id } = job.data;
    console.info(`[Scrapper] Enqueuing movie with id ${id}`);

    this.scrapperService.getMovieDetails(id);
  }
}
