import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { chain, first, values } from "lodash";

export class FieldValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) => {
        const fieldErrors = this.fieldErrors(errors);
        return new BadRequestException(fieldErrors);
      },
    });
  }

  private fieldErrors(errors: ValidationError[]) {
    return chain(errors)
      .keyBy("property")
      .mapValues((e) => first(values(e.constraints)))
      .value();
  }
}
