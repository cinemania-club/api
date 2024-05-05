import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ type: SchemaTypes.ObjectId })
  userId: Oid;

  @Prop({ type: SchemaTypes.String })
  name: string;

  @Prop({ type: [SchemaTypes.String] })
  items: string[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
