import { Process, Processor } from "@nestjs/bull";
import { BaseProcessor } from "../processor";
import { CatalogRatingService } from "./rating.service";

@Processor("catalogRating")
export class CatalogRatingProcessor extends BaseProcessor {
  constructor(private ratingService: CatalogRatingService) {
    super();
  }

  @Process("calculateRatings")
  async calculateRatings() {
    await this.ratingService.calculateRatings();
  }
}
