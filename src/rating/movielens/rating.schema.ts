import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type MovielensRatingDocument = HydratedDocument<MovielensRating>;

@Schema({ timestamps: true })
export class MovielensRating {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.Number, required: true })
  userId!: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  movieId!: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  rating!: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  timestamp!: number;
}

export const MovielensRatingSchema =
  SchemaFactory.createForClass(MovielensRating);
