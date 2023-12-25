import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const module = process.env.WORKER ? WorkerModule : AppModule;
  const app = await NestFactory.create(module);
  await app.listen(3000);
}
bootstrap();
