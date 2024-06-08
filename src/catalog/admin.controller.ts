import { InjectQueue } from "@nestjs/bull";
import { Controller, Post } from "@nestjs/common";
import { Queue } from "bull";
import { Admin } from "src/auth/auth.guard";
import { ProcessorType, ProcessType } from "src/processor";

@Admin()
@Controller("/admin/catalog")
export class CatalogAdminController {
  constructor(
    @InjectQueue(ProcessorType.RATING) private catalogRatingQueue: Queue,
  ) {}

  @Post("/calculate-ratings")
  async calculateRatings() {
    await this.catalogRatingQueue.add(ProcessType.CALCULATE_RATINGS);
  }
}
