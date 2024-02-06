import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [AdminModule, MongooseModule.forRoot("mongodb://mongo/cinemania")],
})
export class ApiModule {}
