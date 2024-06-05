import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Job, Queue } from "bull";
import { Cache } from "cache-manager";
import { BaseProcessor, ProcessorType, ProcessType } from "../processor";
import { POPULAR_ITEMS_PAGES_LIMIT } from "./constants";
import { ScrapperService } from "./scrapper.service";

@Processor(ProcessorType.TMDB)
export class TmdbProcessor extends BaseProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(ProcessorType.TMDB) private tmdbQueue: Queue,
    private scrapperService: ScrapperService,
  ) {
    super();
  }

  @Process(ProcessType.GET_POPULAR_MOVIES)
  async getPopularMovies(job: Job<{ page?: number }>) {
    const processId = await this.cacheManager.get(
      ProcessorType.TMDB + ":" + ProcessType.GET_POPULAR_MOVIES,
    );
    if (!processId) return;

    const page = job.data.page || 1;
    if (page > POPULAR_ITEMS_PAGES_LIMIT) return;

    const nextPage = page + 1;
    await this.tmdbQueue.add(ProcessType.GET_POPULAR_MOVIES, {
      page: nextPage,
    });

    const moviesToReload = await this.scrapperService.getPopularMovies(page);

    const jobs = moviesToReload.map((id) => ({
      name: ProcessType.GET_POPULAR_MOVIE_ITEM,
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  @Process(ProcessType.GET_POPULAR_MOVIE_ITEM)
  async getPopularMovieItem(job: Job<{ id: number }>) {
    const processId = await this.cacheManager.get(
      ProcessorType.TMDB + ":" + ProcessType.GET_POPULAR_MOVIES,
    );
    if (!processId) return;

    await this.scrapperService.getMovie(job.data.id);
  }

  @Process(ProcessType.GET_MOVIE)
  async getMovie(job: Job<{ id: number }>) {
    await this.scrapperService.getMovie(job.data.id);
  }
}
