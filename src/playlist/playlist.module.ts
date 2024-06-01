import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogHydrationModule } from "src/catalog/hydration/hydration.module";
import { PlaylistItem, PlaylistItemSchema } from "./playlist-item.schema";
import { PlaylistController } from "./playlist.controller";
import { Playlist, PlaylistSchema } from "./playlist.schema";
import { PlaylistService } from "./playlist.service";

@Module({
  controllers: [PlaylistController],
  providers: [PlaylistService],
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
      { name: PlaylistItem.name, schema: PlaylistItemSchema },
    ]),
    CatalogHydrationModule,
  ],
  exports: [PlaylistService],
})
export class PlaylistModule {}
