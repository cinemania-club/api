import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";
import { DataSource } from "src/types";

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true })
export class Rating {
  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: DataSource,
    default: DataSource.INTERNAL,
  })
  source!: DataSource;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  userId!: Oid | number;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  itemId!: Oid;

  @Prop({ type: SchemaTypes.Number, required: false })
  stars?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
