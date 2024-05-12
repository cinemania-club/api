import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.String, required: true })
  username!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  email!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  name!: string;

  @Prop({ type: SchemaTypes.String, required: false })
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
