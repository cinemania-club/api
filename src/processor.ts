import { OnQueueActive, OnQueueFailed } from "@nestjs/bull";
import * as Sentry from "@sentry/node";
import { Job } from "bull";

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
