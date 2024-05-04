import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, SchemaTypes } from "mongoose";

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId: ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  itemId: ObjectId;

  @Prop({ type: SchemaTypes.Number })
  stars?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
