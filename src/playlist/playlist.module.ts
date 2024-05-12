import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogModule } from "src/catalog/catalog.module";
import { PlaylistController } from "./playlist.controller";
import { Playlist, PlaylistSchema } from "./playlist.schema";
import { PlaylistService } from "./playlist.service";

@Module({
  controllers: [PlaylistController],
  providers: [PlaylistService],
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
    ]),
    CatalogModule,
  ],
  exports: [PlaylistService],
})
export class PlaylistModule {}
