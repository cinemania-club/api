import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { $oid } from "src/mongo";
import { PLAYLIST_FIELDS } from "src/playlist/constants";
import { Rating } from "src/rating/rating.schema";
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
import { CatalogHydration } from "./hydration/hydration.service";
import { CatalogItemFormat } from "./item.schema";

@Controller("/catalog")
export class CatalogController {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    private catalogService: CatalogService,
    private catalogHydration: CatalogHydration,
  ) {}

  @Anonymous()
  @Post()
  async getCatalog(@Req() req: Request, @Body() filters: FilterCatalogDto) {
    const result = await this.catalogService.getCatalog(
      filters,
      req.payload!.userId,
    );

    const currentRatings = await this.ratingModel.countDocuments({
      userId: req.payload!.userId,
      stars: { $ne: null },
    });

    const isOnboarding = currentRatings < ONBOARDING_TARGET_RATINGS;
    const onboarding = {
      currentRatings,
      targetRatings: ONBOARDING_TARGET_RATINGS,
    };

    return {
      onboarding: isOnboarding ? onboarding : null,
      total: result.total,
      playlists: result.playlists.map((p) => pick(p, PLAYLIST_FIELDS)),
      items: result.items.map((item) => pick(item, CATALOG_FIELDS)),
    };
  }

  @Anonymous()
  @Get("/search")
  async search(@Req() req: Request, @Body() dto: SearchDto) {
    const movies = await this.catalogService.search(
      req.payload!.userId,
      CatalogItemFormat.MOVIE,
      dto,
    );

    const series = await this.catalogService.search(
      req.payload!.userId,
      CatalogItemFormat.SERIES,
      dto,
    );

    return {
      playlists: movies.playlists.map((p) => pick(p, PLAYLIST_FIELDS)),
      movies: movies.items.map((item) => pick(item, CATALOG_FIELDS)),
      series: series.items.map((item) => pick(item, CATALOG_FIELDS)),
    };
  }

  @Anonymous()
  @Get("/:id")
  async getItem(@Req() req: Request, @Param() params: CatalogItemDto) {
    const result = await this.catalogHydration.hydrateItems(
      [$oid(params.id)],
      req.payload!.userId,
    );

    const [item] = result.items;

    return {
      playlists: result.playlists.map((p) => pick(p, PLAYLIST_FIELDS)),
      item: pick(item, CATALOG_ITEM_FIELDS),
    };
  }

  @Anonymous()
  @Post("/:id/rate")
  async rate(
    @Req() req: Request,
    @Param() params: CatalogItemDto,
    @Body() rating: RatingDto,
  ) {
    await this.ratingModel.findOneAndUpdate(
      { itemId: params.id, userId: req.payload!.userId.toString() },
      { stars: rating.stars || null },
      { upsert: true },
    );
  }
}
