import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperModule } from './scrapper/scrapper.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://mongo/letsMovie'),
    ScrapperModule,
  ],
})
export class WorkerModule {}
