import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

type MoviesList = {
  results: TmdbMovie[];
  page: number;
  total_pages: number;
  total_results: number;
};

export type TmdbMovie = {
  id: number;
  backdrop_path: string;
  poster_path: string;
  original_title: string;
  title: string;
  genres: TmdbMovieGenre[];
  release_date: string;
  runtime: number;
  vote_average: number;
  popularity: number;
  tagline: string;
  overview: string;
};
type TmdbMovieGenre = {
  id: number;
  name: string;
};

type Series = {
  id: number;
  first_air_date: string;
};

@Injectable()
export class TmdbAdapter {
  private instance: AxiosInstance;

  constructor(configService: ConfigService) {
    const token = configService.get<string>("TMDB_API_TOKEN");

    this.instance = axios.create({
      baseURL: "https://api.themoviedb.org/3",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getPopular(page: number) {
    console.info(`[Scrapper] Fetching popular movies from TMDB. Page: ${page}`);

    const response = await this.instance.get<MoviesList>("/movie/popular", {
      params: { page },
    });

    return response.data;
  }

  async getMovieDetails(id: number) {
    console.info(`[Scrapper] Fetching movie from TMDB: ${id}`);

    const response = await this.instance.get<TmdbMovie>(
      "/movie/" + id.toString(),
      {
        params: {
          language: "pt-BR",
          append_to_response: "watch/providers",
        },
      },
    );

    const movie = response.data;
    const release_date = movie.release_date && new Date(movie.release_date);

    return { ...movie, _id: movie.id, release_date };
  }

  async getSeriesDetails(id: number) {
    console.info(`[Scrapper] Fetching series from TMDB: ${id}`);

    const response = await this.instance.get<Series>("/tv/" + id.toString(), {
      params: {
        language: "pt-BR",
        append_to_response: "watch/providers",
      },
    });

    const series = response.data;
    const first_air_date =
      series.first_air_date && new Date(series.first_air_date);

    return { ...series, _id: series.id, first_air_date };
  }
}
