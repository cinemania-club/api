import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";
import { DataSource } from "src/types";

export type RatingDocument = HydratedDocument<Rating>;

export class Critic {
  @Prop({ type: SchemaTypes.String, required: true, enum: DataSource })
  source!: DataSource;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  userId!: Oid | number;
}

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: Critic, required: true })
  critic!: Critic;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  itemId!: Oid;

  @Prop({ type: SchemaTypes.Number, required: false })
  stars?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
