// Force to load envs before anything else
import * as dotenv from "dotenv";
dotenv.config();

import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import { FieldValidationPipe } from "./field-validation.pipe";
import { MainModule } from "./main.module";
import { SentryFilter } from "./sentry.filter";

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });

  const app = await NestFactory.create(MainModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  app.useGlobalPipes(new FieldValidationPipe());

  app.enableCors();
  await app.listen(3000);
}

bootstrap();
