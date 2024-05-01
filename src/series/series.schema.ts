import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type SeriesDocument = HydratedDocument<Series>;

@Schema({ timestamps: true, strict: false })
export class Series {
  @Prop()
  _id: number;

  @Prop({ type: SchemaTypes.Date, required: true })
  loadedAt: Date;
}

export const SeriesSchema = SchemaFactory.createForClass(Series);
