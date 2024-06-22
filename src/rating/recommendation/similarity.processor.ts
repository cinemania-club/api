import { Process, Processor } from "@nestjs/bull";
import { InjectModel } from "@nestjs/mongoose";
import { Job } from "bull";
import { Model } from "mongoose";
import { BaseProcessor, ProcessorType, ProcessType } from "src/processor";
import { Critic } from "../critic.schema";
import { SimilarityService } from "./similarity.service";

@Processor(ProcessorType.SIMILARITY)
export class SimilarityProcessor extends BaseProcessor {
  constructor(
    @InjectModel(Critic.name) private criticModel: Model<Critic>,
    private similarityService: SimilarityService,
  ) {
    super();
  }

  @Process(ProcessType.CALCULATE_SIMILARITY)
  async calculateSimilarity(job: Job<{ critic1: string; critic2: string }>) {
    const critic1 = await this.getCritic(job.data.critic1);
    const critic2 = await this.getCritic(job.data.critic2);
    if (!critic1 || !critic2) return;

    await this.similarityService.calculateSimilarity(critic1, critic2);
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
