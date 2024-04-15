import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, SchemaTypes } from "mongoose";

export type MovieVoteDocument = HydratedDocument<MovieVote>;

@Schema({ timestamps: true })
export class MovieVote {
  @Prop({ type: SchemaTypes.Number })
  movieId: number;

  @Prop({ type: SchemaTypes.ObjectId })
  userId: ObjectId;

  @Prop({ type: SchemaTypes.Number })
  stars: number;
}

export const MovieVoteSchema = SchemaFactory.createForClass(MovieVote);
