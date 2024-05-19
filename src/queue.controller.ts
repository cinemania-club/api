import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Controller, Delete, Get, Inject, Param, Post } from "@nestjs/common";
import { Cache } from "cache-manager";
import { Admin } from "src/auth/auth.guard";
import { v4 as uuidv4 } from "uuid";

@Admin()
@Controller("/admin/queue")
export class QueueAdminController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Post("/:queue/:process")
  async enqueue(@Param() params: { queue: string; process: string }) {
    const key = `${params.queue}:${params.process}`;
    const uuid = uuidv4();
    await this.cacheManager.set(key, uuid);
  }

  @Get("/:queue/:process")
  async status(@Param() params: { queue: string; process: string }) {
    const key = `${params.queue}:${params.process}`;
    return { status: await this.cacheManager.get(key) };
  }

  @Delete("/:queue/:process")
  async flush(@Param() params: { queue: string; process: string }) {
    const key = `${params.queue}:${params.process}`;
    await this.cacheManager.del(key);
  }
}
