import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  itemId!: Oid;

  @Prop({ type: SchemaTypes.Number, required: false })
  stars?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
