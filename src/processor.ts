import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from "@nestjs/bull";
import * as Sentry from "@sentry/node";
import { Job } from "bull";

export enum ProcessorType {
  MOVIELENS = "movielens",
}

export enum ProcessType {
  LOAD_RATINGS = "load-ratings",
}

export abstract class BaseProcessor {
  @OnQueueActive()
  jobStarted(job: Job) {
    const details = {
      queue: job.queue.name,
      name: job.name,
      id: job.id,
      data: job.data,
    };

    console.info(`Job started: ${JSON.stringify(details)}`);
  }

  @OnQueueCompleted()
  jobFinished(job: Job) {
    const details = {
      queue: job.queue.name,
      name: job.name,
      id: job.id,
      data: job.data,
    };

    console.info(`Job finished: ${JSON.stringify(details)}`);
  }

  @OnQueueFailed()
  jobFailed(job: Job, error: Error) {
    const details = {
      name: job.name,
      id: job.id,
      data: job.data,
    };

    const msg = error.stack || error.message;
    console.error(`Job failed: ${JSON.stringify(details)}. ${msg}`);
    Sentry.captureException(error, {
      contexts: { job: details },
    });
  }
}
