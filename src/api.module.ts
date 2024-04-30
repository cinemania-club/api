import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminModule } from "./admin/admin.module";
import { MONGO_URL } from "./constants";
import { MovieModule } from "./movie/movie.module";
import { PlaylistModule } from "./playlist/playlist.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URL),
    AdminModule,
    MovieModule,
    PlaylistModule,
    UserModule,
  ],
})
export class ApiModule {}
