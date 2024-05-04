import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

type ItemList<T> = {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
};

type TmdbMovie = {
  id: number;
  backdrop_path: string;
  poster_path: string;
  original_title: string;
  title: string;
  tagline: string;
  overview: string;
  genres: Genre[];
  release_date: string;
  runtime: number;
  popularity: number;
  vote_average: number;
  vote_count: number;
};

type TmdbSeries = {
  id: number;
  backdrop_path: string;
  poster_path: string;
  original_name: string;
  name: string;
  tagline: string;
  overview: string;
  genres: Genre[];
  episode_run_time: number[];
  first_air_date: string;
  last_air_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
};

type Genre = {
  id: number;
  name: string;
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

  async getPopularMovies(page: number) {
    console.info(`[Scrapper] Fetching popular movies from TMDB. Page: ${page}`);

    const response = await this.instance.get<ItemList<TmdbMovie>>(
      "/movie/popular",
      { params: { page } },
    );

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

    return response.data;
  }

  async getPopularSeries(page: number) {
    console.info(`[Scrapper] Fetching popular series from TMDB. Page: ${page}`);

    const response = await this.instance.get<ItemList<TmdbSeries>>(
      "/tv/popular",
      { params: { page } },
    );

    return response.data;
  }

  async getSeriesDetails(id: number) {
    console.info(`[Scrapper] Fetching series from TMDB: ${id}`);

    const response = await this.instance.get<TmdbSeries>(
      "/tv/" + id.toString(),
      {
        params: {
          language: "pt-BR",
          append_to_response: "watch/providers",
        },
      },
    );

    return response.data;
  }
}
