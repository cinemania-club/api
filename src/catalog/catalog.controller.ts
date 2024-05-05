import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { pick } from "lodash";
import { Anonymous } from "src/auth/auth.guard";
import { $oid } from "src/mongo";
import { RatingService } from "src/rating/rating.service";
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
  ONBOARDING_TARGET_RATINGS,
} from "./constants";
import { CatalogItemFormat } from "./item.schema";

@Controller("/catalog")
export class CatalogController {
  constructor(
    private catalogService: CatalogService,
    private ratingService: RatingService,
  ) {}

  @Anonymous()
  @Post()
  async getCatalog(@Req() req: Request, @Body() filters: FilterCatalogDto) {
    const result = await this.catalogService.getCatalog(
      filters,
      req.payload!.userId,
    );

    const currentRatings = await this.ratingService.countUserRatings(
      req.payload!.userId,
    );
    let onboarding = null;
    if (currentRatings < ONBOARDING_TARGET_RATINGS) {
      onboarding = { currentRatings, targetRatings: ONBOARDING_TARGET_RATINGS };
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
    await this.ratingService.rateItem(
      req.payload!.userId.toString(),
      params.id,
      rating.stars,
    );
  }
}
