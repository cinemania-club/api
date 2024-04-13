import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, strict: false })
export class User {
  @Prop()
  _id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
