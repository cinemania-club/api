import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, strict: false })
export class Movie {
  @Prop()
  title: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
