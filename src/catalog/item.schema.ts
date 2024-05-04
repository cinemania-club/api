import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type CatalogItemDocument = HydratedDocument<CatalogItem>;

export enum CatalogItemFormat {
  MOVIE = "MOVIE",
  SERIES = "SERIES",
}

@Schema({ collection: "catalog", timestamps: true })
export class CatalogItem {
  @Prop({ type: SchemaTypes.String, enum: CatalogItemFormat, required: true })
  format: CatalogItemFormat;
  @Prop({ type: SchemaTypes.Number, required: true })
  id: number;

  @Prop({ type: SchemaTypes.String, required: true })
  backdrop_path: string;
  @Prop({ type: SchemaTypes.String, required: true })
  poster_path: string;

  @Prop({ type: SchemaTypes.String, required: true })
  original_title: string;
  @Prop({ type: SchemaTypes.String, required: true })
  title: string;
  @Prop({ type: SchemaTypes.String, required: true })
  tagline: string;
  @Prop({ type: SchemaTypes.String, required: true })
  overview: string;

  @Prop({ type: [SchemaTypes.Number], required: true })
  genres: number[];
  @Prop({ type: SchemaTypes.Number, required: true })
  runtime: number;
  @Prop({ type: SchemaTypes.Date, required: true })
  release_date: Date;
  @Prop({ type: SchemaTypes.Date })
  last_air_date?: Date;

  @Prop({ type: SchemaTypes.Number, required: true })
  popularity: number;
  @Prop({ type: SchemaTypes.Number, required: true })
  vote_average: number;
  @Prop({ type: SchemaTypes.Number, required: true })
  vote_count: number;

  @Prop({ type: SchemaTypes.Date, required: true })
  loadedAt: Date;
  @Prop({ type: SchemaTypes.Date })
  indexedAt?: Date;
}

export const CatalogSchema = SchemaFactory.createForClass(CatalogItem);
