import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { redisStore } from "cache-manager-redis-yet";
import { AuthController } from "./auth/auth.controller";
import { AuthGuard } from "./auth/auth.guard";
import { Auth, AuthSchema } from "./auth/auth.schema";
import { JWT_EXPIRATION } from "./auth/constants";
import { CatalogController } from "./catalog/catalog.controller";
import { CatalogService } from "./catalog/catalog.service";
import { CatalogHydration } from "./catalog/hydration.service";
import { CatalogItem, CatalogSchema } from "./catalog/item.schema";
import { LoaderService } from "./catalog/loader.service";
import { SearchService } from "./catalog/search.service";
import { ELASTICSEARCH_URL, MONGO_URL, REDIS_URL } from "./constants";
import {
  PlaylistItem,
  PlaylistItemSchema,
} from "./playlist/playlist-item.schema";
import { PlaylistController } from "./playlist/playlist.controller";
import { Playlist, PlaylistSchema } from "./playlist/playlist.schema";
import { PlaylistExternal } from "./playlist/playlist.service";
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
import { ScrapperService } from "./scrapper/scrapper.service";
import { TmdbAdapter } from "./scrapper/tmdb.adapter";
import { TmdbProcessor } from "./scrapper/tmdb.processor";
import { ConnectionController } from "./user/connection/connection.controller";
import {
  Connection,
  ConnectionSchema,
} from "./user/connection/connection.schema";
import { UserController } from "./user/user.controller";
import { User, UserSchema } from "./user/user.schema";
import { UserService } from "./user/user.service";

@Module({
  controllers: [
    QueueAdminController,
    AuthController,
    CatalogController,
    UserController,
    ConnectionController,
    PlaylistController,
  ],
  providers: [
    RatingService,
    RatingProcessor,
    MovielensProcessor,
    ScrapperService,
    TmdbProcessor,
    TmdbAdapter,
    LoaderService,
    CatalogService,
    SearchService,
    UserService,
    CatalogHydration,
    PlaylistExternal,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(MONGO_URL),
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: CatalogItem.name, schema: CatalogSchema },
      { name: MovielensLink.name, schema: MovielensLinkSchema },
      { name: MovielensRating.name, schema: MovielensRatingSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: User.name, schema: UserSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: Playlist.name, schema: PlaylistSchema },
      { name: PlaylistItem.name, schema: PlaylistItemSchema },
    ]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: () => redisStore({ url: REDIS_URL }),
    }),
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue(
      { name: ProcessorType.TMDB, limiter: { max: 1, duration: 100 } },
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
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRATION },
    }),
  ],
})
export class MainModule {}
