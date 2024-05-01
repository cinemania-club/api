import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, strict: false })
export class Movie {
  @Prop()
  _id: number;

  @Prop()
  backdrop_path: string;
  @Prop()
  poster_path: string;

  @Prop()
  original_title: string;
  @Prop()
  title: string;

  @Prop()
  genres: MovieGenre[];
  @Prop()
  release_date: Date;
  @Prop()
  runtime: number;

  @Prop()
  vote_average: number;
  @Prop()
  popularity: number;

  @Prop()
  tagline: string;
  @Prop()
  overview: string;

  @Prop({ type: SchemaTypes.Date, required: true })
  loadedAt: Date;
  @Prop({ type: SchemaTypes.Date })
  indexedAt?: Date;
}

@Schema()
export class MovieGenre {
  @Prop()
  id: number;

  @Prop()
  name: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
