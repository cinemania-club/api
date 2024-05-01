import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type SeriesDocument = HydratedDocument<Series>;

@Schema({ timestamps: true, strict: false })
export class Series {
  @Prop()
  _id: number;

  @Prop()
  original_name: string;
  @Prop()
  name: string;

  @Prop()
  tagline: string;
  @Prop()
  overview: string;

  @Prop({ type: SchemaTypes.Date, required: true })
  loadedAt: Date;
  @Prop({ type: SchemaTypes.Date })
  indexedAt?: Date;
}

export const SeriesSchema = SchemaFactory.createForClass(Series);
