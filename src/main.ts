import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import { ApiModule } from "./api.module";
import { isApi } from "./constants";
import { SentryFilter } from "./sentry.filter";
import { WorkerModule } from "./worker/worker.module";

async function bootstrap() {
  Sentry.init({
    dsn: process.env.WORKER
      ? process.env.SENTRY_DSN_WORKER
      : process.env.SENTRY_DSN_API,
    environment: process.env.NODE_ENV,
  });

  const module = isApi ? ApiModule : WorkerModule;
  const app = await NestFactory.create(module);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  await app.listen(3000);
}

bootstrap();
