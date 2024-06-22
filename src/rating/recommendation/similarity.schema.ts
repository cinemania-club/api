import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type SimilarityDocument = HydratedDocument<Similarity>;

@Schema({ timestamps: true })
export class Similarity {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  critic1!: Oid;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  critic2!: Oid;

  @Prop({ type: SchemaTypes.Number, required: true })
  similarity!: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  sample!: number;
}

export const SimilaritySchema = SchemaFactory.createForClass(Similarity);
