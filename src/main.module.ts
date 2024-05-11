import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { CatalogModule } from "./catalog/catalog.module";
import { MONGO_URL, REDIS_URL } from "./constants";
import { PlaylistModule } from "./playlist/playlist.module";
import { ScrapperModule } from "./scrapper/scrapper.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(MONGO_URL),
    ScheduleModule.forRoot(),
    BullModule.forRoot({ redis: REDIS_URL }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    CatalogModule,
    PlaylistModule,
    UserModule,
    ScrapperModule,
  ],
})
export class MainModule {}
