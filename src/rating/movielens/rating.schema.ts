import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UUID } from "crypto";
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

  @Prop({ type: SchemaTypes.UUID, required: false })
  processId?: UUID;
}

export const MovielensRatingSchema =
  SchemaFactory.createForClass(MovielensRating);
