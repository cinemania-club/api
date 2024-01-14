import { OnQueueFailed } from "@nestjs/bull";
import * as Sentry from "@sentry/node";
import { Job } from "bull";

export abstract class BaseProcessor {
  @OnQueueFailed()
  jobFailed(job: Job, error: Error) {
    const details = {
      name: job.name,
      id: job.id,
      data: job.data,
    };

    const msg = error.stack || error.message;
    console.error(
      `[Worker] Job failed. Job details: ${JSON.stringify(details)}. ${msg}`,
    );
    Sentry.captureException(error, {
      contexts: { job: details },
    });
  }
}
