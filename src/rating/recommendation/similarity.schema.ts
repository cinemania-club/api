import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";
import { Critic } from "../rating.schema";

export type SimilarityDocument = HydratedDocument<Similarity>;

@Schema({ timestamps: true })
export class Similarity {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: Critic, required: true })
  critic1!: Critic;

  @Prop({ type: Critic, required: true })
  critic2!: Critic;

  @Prop({ type: SchemaTypes.Number, required: true })
  similarity!: number;

  @Prop({ type: SchemaTypes.Number, required: true })
  sample!: number;
}

export const SimilaritySchema = SchemaFactory.createForClass(Similarity);
