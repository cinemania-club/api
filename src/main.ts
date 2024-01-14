import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module";
import { SentryFilter } from "./sentry.filter";
import { WorkerModule } from "./worker/worker.module";

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });

  const module = process.env.WORKER ? WorkerModule : AppModule;
  const app = await NestFactory.create(module);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
