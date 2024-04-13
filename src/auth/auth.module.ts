import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Auth, AuthSchema } from "./auth.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
  ],
  exports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
  ],
  controllers: [],
})
export class AuthModule {}
