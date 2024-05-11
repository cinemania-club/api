import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type AuthDocument = HydratedDocument<Auth>;

class User {
  @Prop({ type: SchemaTypes.String, required: true })
  username!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  password!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  name!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  email!: string;

  @Prop({ type: SchemaTypes.String, required: false })
  phone?: string;
}

@Schema({ timestamps: true })
export class Auth {
  @Prop({ type: SchemaTypes.String, required: true })
  uuid!: string;

  @Prop({ type: User, required: false })
  user?: User;

  @Prop({ type: SchemaTypes.Boolean, required: false })
  admin?: boolean;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
