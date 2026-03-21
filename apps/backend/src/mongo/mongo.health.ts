import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { MongoService } from './mongo.service';

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  constructor(private readonly mongo: MongoService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.mongo.isConnected()) {
      return this.getStatus(key, true, { message: 'Atlas not configured (disabled)' });
    }

    const ok = await this.mongo.ping();
    return this.getStatus(key, ok, ok ? undefined : { message: 'Atlas unreachable' });
  }
}
