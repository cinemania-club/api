import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BRT, isProduction } from "src/constants";
import { MovieService } from "./movie.service";

@Injectable()
export class MovieScheduler {
  constructor(private movieService: MovieService) {}

  @Cron("*/30 * * * * *", { timeZone: BRT, disabled: !isProduction })
  async indexMovies() {
    this.movieService.indexMovies();
  }
}
