import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { ELASTICSEARCH_URL } from "src/constants";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";

@Module({
  controllers: [],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
  ],
  exports: [UserService],
})
export class UserModule {}
