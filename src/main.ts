import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module";
import { SentryFilter } from "./sentry.filter";
import { WorkerModule } from "./worker/worker.module";

async function bootstrap() {
  Sentry.init({
    dsn: "https://c6add7e431af71133adac45322e3b12a@o4506566591512576.ingest.sentry.io/4506566641582080",
    environment: "development",
  });

  const module = process.env.WORKER ? WorkerModule : AppModule;
  const app = await NestFactory.create(module);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
