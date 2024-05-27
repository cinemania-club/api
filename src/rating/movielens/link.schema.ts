import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type MovielensLinkDocument = HydratedDocument<MovielensLink>;

@Schema({ timestamps: true })
export class MovielensLink {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.Number, required: true })
  movieId!: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  tmdbId!: number;
}

export const MovielensLinkSchema = SchemaFactory.createForClass(MovielensLink);
