import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { BaseProcessor } from "src/processor";

@Processor("movielens")
export class MovielensProcessor extends BaseProcessor {
  constructor() {
    // private movielensService: MovielensService
    super();
  }

  @Process("load-ratings")
  async loadRatings(job: Job<{ id: number }>) {
    console.info(`Processing load-ratings job ${job.id}`);
  }
}
