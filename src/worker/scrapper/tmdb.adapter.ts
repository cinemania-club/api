import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

type ItemList<T> = {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
};

type TmdbItem = {
  id: number;
  backdrop_path: string;
  poster_path: string;
  tagline: string;
  overview: string;
  genres: Genre[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  original_language: string;
  spoken_languages: SpokenLanguage[];
  origin_country: string[];
  production_countries: ProductionCountry[];
  production_companies: ProductionCompany[];
  "watch/providers": WatchProviders;
};

type TmdbMovie = TmdbItem & {
  original_title: string;
  title: string;
  release_date: string;
  runtime: number;
};

type TmdbSeries = TmdbItem & {
  original_name: string;
  name: string;
  first_air_date: string;
  last_air_date: string;
  episode_run_time: number[];
};

type Genre = {
  id: number;
  name: string;
};

type SpokenLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

type ProductionCountry = {
  iso_3166_1: string;
  name: string;
};

type ProductionCompany = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

type WatchProviders = {
  results: {
    BR?: {
      link: string;
      ads: WatchProvider[];
      buy: WatchProvider[];
      flatrate: WatchProvider[];
      free: WatchProvider[];
      rent: WatchProvider[];
    };
  };
};

type WatchProvider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
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
