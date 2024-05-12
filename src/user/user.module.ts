import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { ELASTICSEARCH_URL } from "src/constants";
import { ConnectionController } from "./friend/connection.controller";
import { Connection, ConnectionSchema } from "./friend/connection.schema";
import { UserController } from "./user.controller";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController, ConnectionController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Connection.name, schema: ConnectionSchema },
    ]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
  ],
  exports: [UserService],
})
export class UserModule {}
