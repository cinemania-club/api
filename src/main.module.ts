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
import { QueueType } from "./queue";
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
    BullModule.registerQueue({ name: QueueType.MOVIELENS }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    AuthModule,
    CatalogModule,
    PlaylistModule,
    ScrapperModule,
    UserModule,
  ],
})
export class MainModule {}
