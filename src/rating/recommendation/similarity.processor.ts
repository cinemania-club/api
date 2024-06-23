import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Job, Queue } from "bull";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import { BaseProcessor, ProcessorType, ProcessType } from "src/processor";
import { Critic } from "../critic.schema";
import { SimilarityService } from "./similarity.service";

const PROCESSOR =
  ProcessorType.SIMILARITY + ":" + ProcessType.CALCULATE_SIMILARITIES;

@Processor(ProcessorType.SIMILARITY)
export class SimilarityProcessor extends BaseProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(ProcessorType.SIMILARITY) private similarityQueue: Queue,
    @InjectModel(Critic.name) private criticModel: Model<Critic>,
    private similarityService: SimilarityService,
  ) {
    super();
  }

  @Process(ProcessType.CALCULATE_SIMILARITIES)
  async calculateSimilarities(job: Job<{ critic: string }>) {
    const critic = await this.getCritic(job.data.critic);
    if (!critic) return;

    const neighbors =
      await this.similarityService.getPotentialNeighbors(critic);
    console.log({ neighbors });
  }

  @Process(ProcessType.CALCULATE_SIMILARITY)
  async calculateSimilarity(job: Job<{ critic1: string; critic2: string }>) {
    const critic1 = await this.getCritic(job.data.critic1);
    const critic2 = await this.getCritic(job.data.critic2);
    if (!critic1 || !critic2) return;

    await this.similarityService.updateSimilarity(critic1, critic2);
  }

  private async getCritic(criticId: string) {
    const critic = await this.criticModel.findById(criticId);
    if (!critic) {
      console.info(`Critic not found: ${criticId}`);
      return;
    }

    return critic;
  }
}
