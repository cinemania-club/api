import { Process, Processor } from "@nestjs/bull";
import { BaseProcessor, ProcessorType, ProcessType } from "../processor";
import { CatalogRatingService } from "./rating.service";

@Processor(ProcessorType.RATING)
export class CatalogRatingProcessor extends BaseProcessor {
  constructor(private ratingService: CatalogRatingService) {
    super();
  }

  @Process(ProcessType.CALCULATE_RATINGS)
  async calculateRatings() {
    await this.ratingService.calculateRatings();
  }
}
