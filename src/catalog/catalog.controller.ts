import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { CatalogItemDto, RatingDto } from "./catalog.dto";
import { Rating } from "./rating.schema";

@Controller("/catalog")
export class CatalogController {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  @Anonymous()
  @Post("/:id/rate")
  async rate(
    @Req() req: Request,
    @Param() params: CatalogItemDto,
    @Body() rating: RatingDto,
  ) {
    await this.ratingModel.findOneAndUpdate(
      {
        itemId: params.id,
        userId: req.payload!.userId,
      },
      { stars: rating.stars || null },
      { upsert: true },
    );
  }
}
