import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type RatingDocument = HydratedDocument<Rating>;

export enum RatingSource {
  INTERNAL = "INTERNAL",
  MOVIELENS = "MOVIELENS",
}

@Schema({ timestamps: true })
export class Rating {
  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: RatingSource,
    default: RatingSource.INTERNAL,
  })
  source!: RatingSource;

  @Prop({ type: [SchemaTypes.ObjectId, SchemaTypes.Number], required: true })
  userId!: Oid | number;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  itemId!: Oid;

  @Prop({ type: SchemaTypes.Number, required: false })
  stars?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
