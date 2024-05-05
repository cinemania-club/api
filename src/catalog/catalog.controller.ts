import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { $oid } from "src/mongo";
import { Rating } from "../rating/rating.schema";
import {
  CatalogItemDto,
  FilterCatalogDto,
  RatingDto,
  SearchDto,
} from "./catalog.dto";
import { CatalogService } from "./catalog.service";
import {
  CATALOG_FIELDS,
  CATALOG_ITEM_FIELDS,
  ONBOARDING_VOTES,
} from "./constants";
import { CatalogItemFormat } from "./item.schema";

@Controller("/catalog")
export class CatalogController {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    private catalogService: CatalogService,
  ) {}

  @Anonymous()
  @Post()
  async getCatalog(@Req() req: Request, @Body() filters: FilterCatalogDto) {
    const result = await this.catalogService.getCatalog(
      filters,
      req.payload!.userId,
    );

    const votes = await this.ratingModel.countDocuments({
      userId: req.payload!.userId,
      stars: { $ne: null },
    });

    let onboarding = null;
    if (votes < ONBOARDING_VOTES) {
      onboarding = { votes, target: ONBOARDING_VOTES };
    }

    return {
      onboarding,
      total: result.total,
      items: result.items.map((item) => pick(item, CATALOG_FIELDS)),
    };
  }

  @Anonymous()
  @Get("/search")
  async search(@Body() dto: SearchDto) {
    const movies = await this.catalogService.search(
      CatalogItemFormat.MOVIE,
      dto,
    );

    const series = await this.catalogService.search(
      CatalogItemFormat.SERIES,
      dto,
    );

    return {
      movies: movies.map((item) => pick(item, CATALOG_FIELDS)),
      series: series.map((item) => pick(item, CATALOG_FIELDS)),
    };
  }

  @Anonymous()
  @Get("/:id")
  async getItem(@Req() req: Request, @Param() params: CatalogItemDto) {
    const item = await this.catalogService.getCatalogItem(
      $oid(params.id),
      req.payload!.userId,
    );

    return { item: pick(item, CATALOG_ITEM_FIELDS) };
  }

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
