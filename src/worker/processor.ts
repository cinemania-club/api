import { OnQueueFailed } from "@nestjs/bull";
import { Job } from "bull";

export abstract class BaseProcessor {
  @OnQueueFailed()
  jobFailed(job: Job, error: Error) {
    const details = JSON.stringify({
      name: job.name,
      id: job.id,
      data: job.data,
    });

    const msg = error.stack || error.message;
    console.error(`[Worker] Job failed. Job details: ${details}. ${msg}`);
  }
}
