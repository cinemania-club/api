import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { formatISO } from "date-fns";

type Changes = {
  results: ChangesMovie[];
  page: number;
  total_pages: number;
  total_results: number;
};

type ChangesMovie = {
  id: number;
  adult: boolean;
};

type Movie = {
  id: number;

  backdrop_path: string;
  poster_path: string;

  title: string;
  genres: MovieGenre[];
  release_date: string;
  runtime: number;

  overview: string;
};

type MovieGenre = {
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

  async getChanges(date: Date, page: number) {
    const isoDate = formatISO(date, { representation: "date" });
    console.info(
      `[Scrapper] Fetching changes from TMDB. Date: ${isoDate}, page: ${page}`,
    );

    const response = await this.instance.get<Changes>("/movie/changes", {
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
