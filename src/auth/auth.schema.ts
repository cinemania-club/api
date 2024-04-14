import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ timestamps: true, strict: false })
export class Auth {
  @Prop({ type: SchemaTypes.String })
  uuid: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
