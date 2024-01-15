import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { formatISO } from "date-fns";

export type ChangesMovie = {
  id: number;
  adult: boolean;
};

export type Changes = {
  results: ChangesMovie[];
  page: number;
  total_pages: number;
  total_results: number;
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
        start_date: date,
        end_date: date,
        page,
      },
    });

    return response.data;
  }

  async getMovieDetails(id: number) {
    console.info(`[Scrapper] Fetching movie from TMDB: ${id}`);

    const response = await this.instance.get("/movie/" + id.toString());
    return response.data;
  }
}
