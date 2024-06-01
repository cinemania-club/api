import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type PlaylistDocument = HydratedDocument<Playlist>;

export enum PlaylistType {
  WATCH_LATER = "WATCH_LATER",
  ARCHIVED = "ARCHIVED",
  CUSTOM = "CUSTOM",
}

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId!: Oid;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: PlaylistType,
    default: PlaylistType.CUSTOM,
  })
  type!: PlaylistType;

  @Prop({ type: SchemaTypes.String, required: true })
  name!: string;

  @Prop({ type: [SchemaTypes.ObjectId], required: true })
  items!: Oid[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
