import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Job, Queue } from "bull";
import { Cache } from "cache-manager";
import { pick } from "lodash";
import { Model } from "mongoose";
import { $oid } from "src/mongo";
import { BaseProcessor, ProcessorType, ProcessType } from "src/processor";
import { DataSource } from "src/types";
import { User } from "src/user/user.schema";
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
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(ProcessorType.SIMILARITY) private similarityQueue: Queue,
    @InjectModel(User.name) private userModel: Model<User>,
    private similarityService: SimilarityService,
  ) {
    super();
  }

  @Process(ProcessType.CALCULATE_SIMILARITIES)
  async calculateSimilarities() {
    const processId = await this.cacheManager.get(PROCESSOR);
    if (!processId) return;

    await this.similarityQueue.add(ProcessType.CALCULATE_SIMILARITIES);

    const user = await this.userModel.findOneAndUpdate(
      { similarityProcessId: { $ne: processId } },
      { $set: { similarityProcessId: processId } },
      { new: true },
    );

    if (!user) {
      console.info(`No more users to process: ${processId}`);
      this.cacheManager.del(PROCESSOR);
      return;
    }

    const neighbors = await this.similarityService.getPotentialNeighbors(
      user._id,
    );

    const critic1 = { source: DataSource.INTERNAL, userId: user._id };
    const jobs = neighbors.map((e) => ({
      name: ProcessType.CALCULATE_SIMILARITY,
      data: { critic1, critic2: pick(e, "source", "userId") },
    }));

    await this.similarityQueue.addBulk(jobs);
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
