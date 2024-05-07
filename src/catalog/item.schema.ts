import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Oid } from "src/mongo";

export type CatalogItemDocument = HydratedDocument<CatalogItem>;

export enum CatalogItemFormat {
  MOVIE = "MOVIE",
  SERIES = "SERIES",
}

@Schema({ collection: "catalog", timestamps: true })
export class CatalogItem {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  _id!: Oid;

  @Prop({ type: SchemaTypes.String, enum: CatalogItemFormat, required: true })
  format!: CatalogItemFormat;
  @Prop({ type: SchemaTypes.Number, required: true })
  id!: number;

  @Prop({ type: [SchemaTypes.Number], required: true })
  streamings!: number[];

  @Prop({ type: SchemaTypes.String, required: true })
  backdropPath!: string;
  @Prop({ type: SchemaTypes.String, required: true })
  posterPath!: string;

  @Prop({ type: SchemaTypes.String, required: true })
  originalTitle!: string;
  @Prop({ type: SchemaTypes.String, required: true })
  title!: string;
  @Prop({ type: SchemaTypes.String, required: true })
  tagline!: string;
  @Prop({ type: SchemaTypes.String, required: true })
  overview!: string;

  @Prop({ type: [SchemaTypes.Number], required: true })
  genres!: number[];
  @Prop({ type: SchemaTypes.Number, required: true })
  runtime!: number;
  @Prop({ type: SchemaTypes.Date, required: true })
  firstAirDate!: Date;
  @Prop({ type: SchemaTypes.Date, required: true })
  lastAirDate!: Date;

  @Prop({ type: SchemaTypes.Number, required: true })
  popularity!: number;
  @Prop({ type: SchemaTypes.Number, required: true })
  voteAverage!: number;
  @Prop({ type: SchemaTypes.Number, required: true })
  voteCount!: number;

  @Prop({ type: SchemaTypes.String, required: true })
  originalLanguage!: string;
  @Prop({ type: [SchemaTypes.String], required: true })
  spokenLanguages!: string[];

  @Prop({ type: [SchemaTypes.String], required: true })
  originCountry!: string[];
  @Prop({ type: [SchemaTypes.String], required: true })
  productionCountries!: string[];
  @Prop({ type: [SchemaTypes.Number], required: true })
  productionCompanies!: number[];

  @Prop({ type: SchemaTypes.Date, required: true })
  loadedAt!: Date;

  @Prop({ type: SchemaTypes.Number, required: false })
  rating?: number;
}

export const CatalogSchema = SchemaFactory.createForClass(CatalogItem);
