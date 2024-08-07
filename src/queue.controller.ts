import { InjectQueue } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { Admin } from "src/auth.guard";
import { v4 as uuidv4 } from "uuid";
import { ProcessorType } from "./processor";

@Admin()
@Controller("/admin/queue")
export class QueueAdminController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(ProcessorType.MOVIELENS) private movielensQueue: Queue,
    @InjectQueue(ProcessorType.TMDB) private tmdbQueue: Queue,
    @InjectQueue(ProcessorType.RATING) private ratingQueue: Queue,
    @InjectQueue(ProcessorType.SIMILARITY) private similarityQueue: Queue,
  ) {}

  @Post("/:queue/:process")
  async start(
    @Param() params: { queue: string; process: string },
    @Body() payload: any,
  ) {
    const key = `${params.queue}:${params.process}`;
    const queue = this.getQueue(params.queue);
    const uuid = uuidv4();
    console.info(`Starting process: ${key}, ${uuid}`);

    await this.cacheManager.set(key, uuid);
    await queue.add(params.process, payload);
  }

  @Get("/:queue/:process")
  async status(@Param() params: { queue: string; process: string }) {
    const key = `${params.queue}:${params.process}`;
    const status = await this.cacheManager.get(key);
    return { status };
  }

  @Delete("/:queue/:process")
  async flush(@Param() params: { queue: string; process: string }) {
    const key = `${params.queue}:${params.process}`;
    const queue = this.getQueue(params.queue);
    console.info("Flushing process:", key);

    await this.cacheManager.del(key);
    await queue.empty();
  }

  private getQueue(queue: string) {
    switch (queue) {
      case ProcessorType.TMDB:
        return this.tmdbQueue;
      case ProcessorType.MOVIELENS:
        return this.movielensQueue;
      case ProcessorType.RATING:
        return this.ratingQueue;
      case ProcessorType.SIMILARITY:
        return this.similarityQueue;
      default:
        throw new Error(`Queue ${queue} not found`);
    }
  }
}
