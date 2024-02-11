import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminModule } from "./admin/admin.module";
import { MovieModule } from "./movie/movie.module";

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://mongo/cinemania"),
    AdminModule,
    MovieModule,
  ],
})
export class ApiModule {}
