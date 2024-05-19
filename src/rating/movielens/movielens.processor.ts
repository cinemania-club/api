import { Process, Processor } from "@nestjs/bull";
import { BaseProcessor } from "src/processor";
import { MovielensService } from "./movielens.service";

@Processor("movielens")
export class MovielensProcessor extends BaseProcessor {
  constructor(private movielensService: MovielensService) {
    super();
  }

  @Process("loadRatings")
  async loadRatings() {}
}
