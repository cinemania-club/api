import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminModule } from "./admin/admin.module";
import { MovieModule } from "./movie/movie.module";
import { PlaylistModule } from "./playlist/playlist.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://mongo/cinemania"),
    AdminModule,
    MovieModule,
    PlaylistModule,
    UserModule,
  ],
})
export class ApiModule {}
