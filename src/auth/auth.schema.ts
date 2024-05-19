import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type AuthDocument = HydratedDocument<Auth>;

class User {
  @Prop({ type: SchemaTypes.String, required: true })
  email!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  password!: string;
}

@Schema({ timestamps: true })
export class Auth {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  /** @todo: change string to UUID */
  @Prop({ type: SchemaTypes.String, required: true })
  uuid!: string;

  @Prop({ type: User, required: false })
  user?: User;

  @Prop({ type: SchemaTypes.Boolean, required: false })
  admin?: boolean;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
