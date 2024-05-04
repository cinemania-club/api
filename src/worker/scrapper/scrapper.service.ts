import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { CatalogItemFormat } from "src/catalog/item.schema";
import { LoaderService } from "src/catalog/loader.service";
import { POPULAR_ITEMS_PAGES_LIMIT } from "./constants";
import { TmdbAdapter } from "./tmdb.adapter";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private loaderService: LoaderService,
  ) {}

  async getPopularMovies(page: number) {
    const movies = await this.tmdbAdapter.getPopularMovies(page);

    const movieIds = movies.results.map((m) => m.id);
    const moviesToReload = await this.loaderService.getOutdated(
      CatalogItemFormat.MOVIE,
      movieIds,
    );

    const jobs = moviesToReload.map((id) => ({
      name: "getMovieDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (
      movies.page < movies.total_pages &&
      movies.page < POPULAR_ITEMS_PAGES_LIMIT
    ) {
      this.tmdbQueue.add("getPopularMovies", { page: movies.page + 1 });
    }

    return movies;
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
      firstAirDate: new Date(movie.release_date),
      lastAirDate: new Date(movie.release_date),
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      originalLanguage: movie.original_language,
      spokenLanguages: movie.spoken_languages.map((e) => e.iso_639_1),
      originCountry: movie.origin_country,
      productionCountries: movie.production_countries.map((e) => e.iso_3166_1),
      productionCompanies: movie.production_companies.map((e) => e.id),
      streamings: movie["watch/providers"].results.BR.flatrate.map(
        (e) => e.provider_id,
      ),
    });
  }

  async getPopularSeries(page: number) {
    const series = await this.tmdbAdapter.getPopularSeries(page);

    const seriesIds = series.results.map((s) => s.id);
    const seriesToReload = await this.loaderService.getOutdated(
      CatalogItemFormat.SERIES,
      seriesIds,
    );

    const jobs = seriesToReload.map((id) => ({
      name: "getSeriesDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (
      series.page < series.total_pages &&
      series.page < POPULAR_ITEMS_PAGES_LIMIT
    ) {
      this.tmdbQueue.add("getPopularSeries", { page: series.page + 1 });
    }

    return series;
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
      firstAirDate: new Date(series.first_air_date),
      lastAirDate: new Date(series.last_air_date),
      voteAverage: series.vote_average,
      voteCount: series.vote_count,
      originalLanguage: series.original_language,
      originCountry: series.origin_country,
      spokenLanguages: series.spoken_languages.map((e) => e.iso_639_1),
      productionCountries: series.production_countries.map((e) => e.iso_3166_1),
      productionCompanies: series.production_companies.map((e) => e.id),
      streamings: series["watch/providers"].results.BR.flatrate.map(
        (e) => e.provider_id,
      ),
    });
  }
}
