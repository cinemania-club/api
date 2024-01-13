import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";

@Module({
  imports: [
    BullModule.forRoot({ redis: { host: "redis", port: 6379 } }),
    BullModule.registerQueue({ name: "tmdb" }),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
