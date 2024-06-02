import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogHydrationModule } from "src/catalog/hydration/hydration.module";
import { PlaylistItem, PlaylistItemSchema } from "./playlist-item.schema";
import { PlaylistController } from "./playlist.controller";
import { Playlist, PlaylistSchema } from "./playlist.schema";
import { PlaylistExternal } from "./playlist.service";

@Module({
  controllers: [PlaylistController],
  providers: [PlaylistExternal],
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
      { name: PlaylistItem.name, schema: PlaylistItemSchema },
    ]),
    CatalogHydrationModule,
  ],
  exports: [PlaylistExternal],
})
export class PlaylistModule {}
