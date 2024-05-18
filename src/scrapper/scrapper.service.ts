import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { CatalogItemFormat } from "src/catalog/item.schema";
import { LoaderService } from "src/catalog/loader.service";
import { TmdbAdapter } from "./tmdb.adapter";
import { TmdbEnqueuer } from "./tmdb.enqueuer";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private loaderService: LoaderService,
    private tmdbEnqueuer: TmdbEnqueuer,
  ) {}

  async getPopularMovies(page: number) {
    const movies = await this.tmdbAdapter.getPopularMovies(page);

    const movieIds = movies.results.map((m) => m.id);
    const moviesToReload = await this.loaderService.getOutdated(
      CatalogItemFormat.MOVIE,
      movieIds,
    );

    await this.tmdbEnqueuer.enqueueMovieDetails(moviesToReload);
  }

  async getMovieDetails(id: number) {
    const movie = await this.tmdbAdapter.getMovieDetails(id);

    await this.loaderService.load({
      ...movie,
      format: CatalogItemFormat.MOVIE,
      backdropPath: movie.backdrop_path,
      posterPath: movie.poster_path,
      originalTitle: movie.original_title,
      genres: movie.genres.map((e) => e.id),
      firstAirDate: movie.release_date
        ? new Date(movie.release_date)
        : undefined,
      lastAirDate: movie.release_date
        ? new Date(movie.release_date)
        : undefined,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      originalLanguage: movie.original_language,
      spokenLanguages: movie.spoken_languages.map((e) => e.iso_639_1),
      originCountry: movie.origin_country,
      productionCountries: movie.production_countries.map((e) => e.iso_3166_1),
      productionCompanies: movie.production_companies.map((e) => e.id),
      streamings:
        movie["watch/providers"].results.BR?.flatrate?.map(
          (e) => e.provider_id,
        ) || [],
    });
  }

  async getPopularSeries(page: number) {
    const series = await this.tmdbAdapter.getPopularSeries(page);

    const seriesIds = series.results.map((s) => s.id);
    const seriesToReload = await this.loaderService.getOutdated(
      CatalogItemFormat.SERIES,
      seriesIds,
    );

    await this.tmdbEnqueuer.enqueueSeriesDetails(seriesToReload);
  }

  async getSeriesDetails(id: number) {
    const series = await this.tmdbAdapter.getSeriesDetails(id);

    await this.loaderService.load({
      ...series,
      format: CatalogItemFormat.SERIES,
      backdropPath: series.backdrop_path,
      posterPath: series.poster_path,
      originalTitle: series.original_name,
      title: series.name,
      genres: series.genres.map((e) => e.id),
      runtime: series.episode_run_time[0],
      firstAirDate: series.first_air_date
        ? new Date(series.first_air_date)
        : undefined,
      lastAirDate: series.last_air_date
        ? new Date(series.last_air_date)
        : undefined,
      voteAverage: series.vote_average,
      voteCount: series.vote_count,
      originalLanguage: series.original_language,
      originCountry: series.origin_country,
      spokenLanguages: series.spoken_languages.map((e) => e.iso_639_1),
      productionCountries: series.production_countries.map((e) => e.iso_3166_1),
      productionCompanies: series.production_companies.map((e) => e.id),
      streamings:
        series["watch/providers"].results.BR?.flatrate?.map(
          (e) => e.provider_id,
        ) || [],
    });
  }
}
