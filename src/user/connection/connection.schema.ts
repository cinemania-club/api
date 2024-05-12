import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type ConnectionDocument = HydratedDocument<Connection>;

@Schema({ timestamps: true })
export class Connection {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  follower!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  followee!: Oid;

  @Prop({ type: SchemaTypes.Boolean, required: true })
  following!: boolean;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
