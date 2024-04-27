import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, SchemaTypes } from "mongoose";

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ type: SchemaTypes.ObjectId })
  userId: ObjectId;

  @Prop({ type: SchemaTypes.String })
  name: string;

  @Prop({ type: [Number] })
  movies: number[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
