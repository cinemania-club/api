import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { $oid } from "src/mongo";
import { BaseProcessor, ProcessorType, ProcessType } from "src/processor";
import { DataSource } from "src/types";
import { SimilarityService } from "./similarity.service";

type InternalCritic = {
  source: DataSource.INTERNAL;
  userId: string;
};

type MovielensCritic = {
  source: DataSource.MOVIELENS;
  userId: number;
};

type Critic = InternalCritic | MovielensCritic;

const PROCESSOR =
  ProcessorType.SIMILARITY + ":" + ProcessType.CALCULATE_SIMILARITIES;

@Processor(ProcessorType.SIMILARITY)
export class SimilarityProcessor extends BaseProcessor {
  constructor(private similarityService: SimilarityService) {
    super();
  }

  @Process(ProcessType.CALCULATE_SIMILARITIES)
  async calculateSimilarities(job: Job<{ critic: Critic }>) {
    const critic = this.sanitize(job.data.critic);

    const neighbors =
      await this.similarityService.getPotentialNeighbors(critic);
    console.log({ neighbors });
  }

  @Process(ProcessType.CALCULATE_SIMILARITY)
  async calculateSimilarity(job: Job<{ critic1: Critic; critic2: Critic }>) {
    const critic1 = this.sanitize(job.data.critic1);
    const critic2 = this.sanitize(job.data.critic2);

    await this.similarityService.updateSimilarity(critic1, critic2);
  }

  private sanitize(critic: Critic) {
    if (critic.source === DataSource.INTERNAL)
      return {
        source: critic.source,
        userId: $oid(critic.userId),
      };

    return critic;
  }
}
