import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SeriesDocument = HydratedDocument<Series>;

@Schema({ timestamps: true, strict: false })
export class Series {
  @Prop()
  _id: number;
}

export const SeriesSchema = SchemaFactory.createForClass(Series);
