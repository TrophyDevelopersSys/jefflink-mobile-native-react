import { Module, Global, OnModuleInit } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { MongoHealthIndicator } from './mongo.health';

@Global()
@Module({
  providers: [MongoService, MongoHealthIndicator],
  exports: [MongoService, MongoHealthIndicator],
})
export class MongoModule implements OnModuleInit {
  constructor(private readonly mongo: MongoService) {}

  async onModuleInit(): Promise<void> {
    await this.mongo.connect();
  }
}
