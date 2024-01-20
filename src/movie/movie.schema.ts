import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, strict: false })
export class Movie {
  @Prop()
  title: string;

  @Prop()
  genres: MovieGenre[];
}

@Schema()
export class MovieGenre {
  @Prop()
  id: number;

  @Prop()
  name: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
