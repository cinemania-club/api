import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";
import { DataSource } from "src/types";

export type CriticDocument = HydratedDocument<Critic>;

@Schema({ timestamps: true })
export class Critic {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: DataSource,
    default: DataSource.INTERNAL,
  })
  source!: DataSource;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  userId!: Oid | number;
}

export const CriticSchema = SchemaFactory.createForClass(Critic);
