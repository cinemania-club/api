import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ timestamps: true })
export class Auth {
  @Prop({ type: SchemaTypes.String, required: true })
  uuid!: string;

  @Prop({ type: SchemaTypes.String, required: false })
  token?: string;

  @Prop({ type: SchemaTypes.Boolean, required: false })
  admin?: boolean;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
