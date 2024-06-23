import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from "@nestjs/bull";
import * as Sentry from "@sentry/node";
import { Job } from "bull";

export enum ProcessorType {
  TMDB = "tmdb",
  MOVIELENS = "movielens",
  RATING = "rating",
  SIMILARITY = "similarity",
}

export enum ProcessType {
  GET_POPULAR_MOVIES = "get-popular-movies",
  GET_POPULAR_MOVIE_ITEM = "get-popular-movie-item",
  GET_MOVIE = "get-movie",
  GET_POPULAR_SERIES = "get-popular-series",
  GET_POPULAR_SERIES_ITEM = "get-popular-series-item",
  GET_SERIES = "get-series",
  LOAD_RATINGS = "load-ratings",
  CALCULATE_RATINGS = "calculate-ratings",
  CALCULATE_RATING = "calculate-rating",
  CALCULATE_SIMILARITIES = "calculate-similarities",
  CALCULATE_SIMILARITY = "calculate-similarity",
}

export abstract class BaseProcessor {
  context = {};

  @OnQueueActive()
  jobStarted(job: Job) {
    const details = this.getDetails(job);
    console.info(`Job started: ${JSON.stringify(details)}`);
  }

  @OnQueueCompleted()
  jobFinished(job: Job) {
    const details = this.getDetails(job);
    console.info(`Job finished: ${JSON.stringify(details)}`);
  }

  @OnQueueFailed()
  jobFailed(job: Job, error: Error) {
    const details = this.getDetails(job);
    const msg = error.stack || error.message;

    console.error(`Job failed: ${JSON.stringify(details)}. ${msg}`);
    Sentry.captureException(error, {
      contexts: { job: details },
    });
  }

  private getDetails(job: Job) {
    return {
      queue: job.queue.name,
      name: job.name,
      id: job.id,
      data: job.data,
      context: this.context,
    };
  }
}
