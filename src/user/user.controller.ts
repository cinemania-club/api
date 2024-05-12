import { Body, Controller, Get } from "@nestjs/common";
import { pick } from "lodash";
import { Anonymous } from "src/auth/auth.guard";
import { SearchDto } from "./user.dto";
import { UserService } from "./user.service";

@Controller("/user")
export class UserController {
  constructor(private userService: UserService) {}

  @Anonymous()
  @Get("/search")
  async search(@Body() dto: SearchDto) {
    const users = await this.userService.search(dto);
    return users.map((e) => pick(e, "_id", "username", "name"));
  }
}
