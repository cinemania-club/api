import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId!: Oid;

  @Prop({ type: SchemaTypes.String, required: true })
  name!: string;

  @Prop({ type: [SchemaTypes.String], required: true })
  items!: string[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
