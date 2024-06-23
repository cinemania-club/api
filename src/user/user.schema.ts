import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UUID } from "crypto";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type UserDocument = HydratedDocument<User>;

class Profile {
  @Prop({ type: SchemaTypes.String, required: true })
  username!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  email!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  password!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  name!: string;

  @Prop({ type: SchemaTypes.String, required: false })
  phone?: string;
}

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class User {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.UUID, required: true })
  uuid!: UUID;

  @Prop({ type: SchemaTypes.Boolean, required: false })
  admin?: boolean;

  @Prop({ type: Profile, required: false })
  profile?: Profile;

  @Prop({ type: [SchemaTypes.String], required: true, default: [] })
  streamings!: string[];

  @Prop({ type: SchemaTypes.UUID, required: false })
  similarityProcessId?: UUID;

  public get token() {
    return { sub: this._id.toString(), admin: this.admin };
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual("token").get(function () {
  return { sub: this._id.toString(), admin: !!this.admin };
});
