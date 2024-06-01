import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type PlaylistItemDocument = HydratedDocument<PlaylistItem>;

@Schema({ timestamps: true })
export class PlaylistItem {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  playlistId!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  itemId!: Oid;
}

export const PlaylistItemSchema = SchemaFactory.createForClass(PlaylistItem);
