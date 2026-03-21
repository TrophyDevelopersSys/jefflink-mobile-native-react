import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController, DatabaseHealthIndicator, RedisHealthIndicator } from './health.controller';
import { MongoHealthIndicator } from '../mongo/mongo.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, RedisHealthIndicator, MongoHealthIndicator],
})
export class HealthModule {}
