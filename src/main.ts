import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { AppModule } from "./app.module";
import { SentryFilter } from "./sentry.filter";
import { WorkerModule } from "./worker/worker.module";

async function bootstrap() {
  Sentry.init({
    dsn: "https://c6add7e431af71133adac45322e3b12a@o4506566591512576.ingest.sentry.io/4506566641582080",
    integrations: [new ProfilingIntegration()],
    environment: "development",
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  const module = process.env.WORKER ? WorkerModule : AppModule;
  const app = await NestFactory.create(module);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
