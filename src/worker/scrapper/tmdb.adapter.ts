import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { formatISO } from "date-fns";

type MoviesList = {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
};

type Movie = {
  id: number;
  release_date: string;
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

  async getTopRated(page: number) {
    console.info(
      `[Scrapper] Fetching top rated movies from TMDB. Page: ${page}`,
    );

    const response = await this.instance.get<MoviesList>("/movie/top_rated", {
      params: { page },
    });

    return response.data;
  }

  async getPopular(page: number) {
    console.info(`[Scrapper] Fetching popular movies from TMDB. Page: ${page}`);

    const response = await this.instance.get<MoviesList>("/movie/popular", {
      params: { page },
    });

    return response.data;
  }

  async getChanges(date: Date, page: number) {
    const isoDate = formatISO(date, { representation: "date" });
    console.info(
      `[Scrapper] Fetching changes from TMDB. Date: ${isoDate}, page: ${page}`,
    );

    const response = await this.instance.get<MoviesList>("/movie/changes", {
      params: {
        start_date: isoDate,
        end_date: isoDate,
        page,
      },
    });

    return response.data;
  }

  async getMovieDetails(id: number) {
    console.info(`[Scrapper] Fetching movie from TMDB: ${id}`);

    const response = await this.instance.get<Movie>("/movie/" + id.toString(), {
      params: {
        language: "pt-BR",
        append_to_response: "watch/providers",
      },
    });

    const movie = response.data;
    const release_date = movie.release_date && new Date(movie.release_date);

    return { ...movie, release_date };
  }
}
