import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Post } from "@nestjs/common";
import { Queue } from "bull";

@Controller("/admin")
export class AdminController {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  @Post("/get-movie")
  getMovie(@Body("id") id) {
    console.info(`[Admin] Enqueuing movie with id ${id}`);

    // this.client.instance().captureException(new Error("testeee"));
    throw new Error("testeeee");
    // this.tmdbQueue.add("getMovieDetails", { id });
  }
}
