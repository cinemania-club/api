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
import { MONGO_URL, REDIS_URL } from "./constants";
import { PlaylistModule } from "./playlist/playlist.module";
import { ProcessorType } from "./processor";
import { QueueAdminController } from "./queue.controller";
import { ScrapperModule } from "./scrapper/scrapper.module";
import { UserModule } from "./user/user.module";

@Module({
  controllers: [QueueAdminController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(MONGO_URL),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: () => redisStore({ url: REDIS_URL }),
    }),
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue({ name: ProcessorType.MOVIELENS }),
    BullModule.registerQueue({ name: ProcessorType.TMDB }),
    BullModule.registerQueue({ name: ProcessorType.RATING }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: ProcessorType.MOVIELENS,
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: ProcessorType.TMDB,
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: ProcessorType.RATING,
      adapter: BullAdapter,
    }),
    AuthModule,
    CatalogModule,
    PlaylistModule,
    ScrapperModule,
    UserModule,
  ],
})
export class MainModule {}
