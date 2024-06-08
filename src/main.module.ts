import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { redisStore } from "cache-manager-redis-yet";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CatalogItem, CatalogSchema } from "./catalog/item.schema";
import { MONGO_URL, REDIS_URL } from "./constants";
import { PlaylistModule } from "./playlist/playlist.module";
import { ProcessorType } from "./processor";
import { QueueAdminController } from "./queue.controller";
import {
  MovielensLink,
  MovielensLinkSchema,
} from "./rating/movielens/link.schema";
import { MovielensProcessor } from "./rating/movielens/movielens.processor";
import {
  MovielensRating,
  MovielensRatingSchema,
} from "./rating/movielens/rating.schema";
import { RatingProcessor } from "./rating/rating.processor";
import { Rating, RatingSchema } from "./rating/rating.schema";
import { RatingService } from "./rating/rating.service";
import { ScrapperModule } from "./scrapper/scrapper.module";
import { UserModule } from "./user/user.module";

@Module({
  controllers: [QueueAdminController],
  providers: [RatingService, RatingProcessor, MovielensProcessor],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(MONGO_URL),
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: CatalogItem.name, schema: CatalogSchema },
      { name: MovielensLink.name, schema: MovielensLinkSchema },
      { name: MovielensRating.name, schema: MovielensRatingSchema },
    ]),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: () => redisStore({ url: REDIS_URL }),
    }),
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue(
      { name: ProcessorType.TMDB },
      { name: ProcessorType.RATING, limiter: { max: 1, duration: 1000 } },
      { name: ProcessorType.MOVIELENS, limiter: { max: 10, duration: 10 } },
    ),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      { name: ProcessorType.MOVIELENS, adapter: BullAdapter },
      { name: ProcessorType.TMDB, adapter: BullAdapter },
      { name: ProcessorType.RATING, adapter: BullAdapter },
    ),
    AuthModule,
    CatalogModule,
    PlaylistModule,
    ScrapperModule,
    UserModule,
  ],
})
export class MainModule {}
